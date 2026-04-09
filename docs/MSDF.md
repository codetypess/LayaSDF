# MSDF 原理教材

这份文档不是按“代码逐行注释”来写，而是按“先理解原理，再理解 shader”来写。

目标是回答四个问题：

1. MSDF 到底存了什么
2. 为什么它能让文字放大后依然清晰
3. `screenPxRange` 和 `screenDistance` 在做什么
4. 当前项目里的 shader 是怎么把这些原理落地的

## 1. 从普通位图文字开始

先看普通位图文字的问题。

如果一张字体贴图里直接存的是黑白像素，那么放大时看到的是“像素块被放大”：

- 边缘会锯齿
- 小字号和大字号不能共用同一套清晰度
- 想做描边、发光，通常要额外处理

原因很简单：普通位图只告诉你“这里是黑”还是“这里是白”，它没有告诉你“边界在哪里”。

而文字渲染最关键的信息，恰恰是边界。

## 2. SDF 的核心思想

SDF 是 Signed Distance Field，中文一般叫“有符号距离场”。

它不直接存颜色，而是存“每个像素离字形边界有多远”。

可以把字形想成一块区域，边界就是这块区域的轮廓线。  
那么对于任意一个采样点，都有三种情况：

- 在字内
- 在边界上
- 在字外

SDF 会给这个点一个“带符号的距离”：

- 正数：在字内
- 0：在边界
- 负数：在字外

如果画成一条数轴：

```text
字外                    边界                    字内
<-----------------------|----------------------->
       negative          0         positive
```

这样一来，shader 就不再需要依赖原始位图边缘，而是可以直接根据“离边界多远”来决定：

- 该不该显示
- 显示多少透明度
- 描边该有多宽

这就是距离场渲染的基础。

## 3. 为什么要“有符号”

如果只有“距离多远”，但没有正负号，那么 shader 只知道“离边界很近”，却不知道这个点是在字里面还是字外面。

而文字渲染最重要的判断就是：

- 字内应该更不透明
- 字外应该更透明

因此“有符号”是必要的。

## 4. 单通道 SDF 为什么还不够

单通道 SDF 在圆形、平滑轮廓上效果很好，但在尖角、交叉边、复杂轮廓附近容易出问题。

因为一个通道只能存一套距离值，而角点附近往往同时受到多条边的影响。

结果就是：

- 角容易变圆
- 细节会被吃掉
- 复杂笔画处边界不稳定

于是就有了 MSDF。

## 5. MSDF 存的是什么

MSDF 是 Multi-channel Signed Distance Field。

它的思路是：

- 不再只用一个通道存距离
- 而是把不同边的信息分摊到 `R/G/B` 三个通道里

于是纹理的 `RGB` 不再表示颜色，而是三份距离信息。

这三份信息组合起来，可以更准确地恢复复杂边界，尤其是尖角。

所以看 MSDF 纹理时，不应该把它理解成彩色贴图，而应该理解成：

- `R` 是一份距离编码
- `G` 是一份距离编码
- `B` 是一份距离编码

它们共同描述字形边界。

## 6. 为什么要取中值 `median`

当前 shader 里有这段代码：

```glsl
float median3(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}
```

它的作用是从三个通道里恢复一个稳定的距离值。

直觉上可以这样理解：

- 三个通道里可能有一个通道在某些位置偏离较大
- 取最大值容易偏大
- 取最小值容易偏小
- 取中间那个值更稳定

所以 shader 会这样写：

```glsl
vec3 msdf = texture2D(u_spriteTexture, texcoord).rgb;
float sd = median3(msdf.r, msdf.g, msdf.b);
```

这里的 `sd` 不是显示颜色，而是“从 MSDF 里恢复出来的距离编码值”。

## 7. 为什么边界通常写成 `0.5`

在很多 MSDF/SDF 实现中，距离会被映射到 `[0, 1]` 范围附近，常把 `0.5` 当作边界中心。

于是：

- `sd > 0.5`：偏向字内
- `sd = 0.5`：接近边界
- `sd < 0.5`：偏向字外

这就是为什么 shader 会先做：

```glsl
float signedDistance = sd - 0.5;
```

这一步非常关键，因为它把原来的编码值，转换成了“以边界为 0 的 signed distance”。

变换之后：

- `signedDistance > 0`：在字内
- `signedDistance = 0`：在边界
- `signedDistance < 0`：在字外

也就是说，`sd - 0.5` 这一步，是把“纹理编码”翻译成“几何意义”。

## 8. 只做到这里还不够

到目前为止，shader 只知道：

- 这个点在边界内还是外
- 这个点距离边界远还是近

但它还不知道一件更重要的事：

- 这个距离在屏幕上相当于多少像素

为什么这件事重要？

因为文字可以缩放。

同一个 `signedDistance = 0.02`：

- 在大字号下，可能对应屏幕上 2 个像素
- 在小字号下，可能只对应 0.2 个像素

如果 shader 不知道当前缩放比例，就没法决定抗锯齿带应该有多宽，也没法让描边在不同字号下保持稳定。

这就是 `screenPxRange` 要解决的问题。

## 9. `fwidth` 的几何意义

在解释 `screenPxRange` 之前，要先理解 `fwidth(texcoord)`。

它不是“某个 UV 的固定属性”，而是“当前片元附近，UV 在屏幕上变化得有多快”。

近似可以理解成：

```glsl
abs(dFdx(texcoord)) + abs(dFdy(texcoord))
```

含义是：

- 当前屏幕上 1 个像素，大概覆盖了多少 UV

于是：

- 如果文字很大，一个屏幕像素只覆盖很小的 UV 范围，`fwidth` 就小
- 如果文字很小，一个屏幕像素覆盖更大的 UV 范围，`fwidth` 就大

所以 `fwidth` 其实反映了“当前缩放下，纹理在屏幕上的密度”。

## 10. `screenPxRange` 的真正含义

当前 shader 中的函数是：

```glsl
float screenPxRange(vec2 texcoord) {
    vec2 unitRange = vec2(u_DistanceRange) / u_AtlasSize;
    vec2 screenTexSize = vec2(1.0) / max(fwidth(texcoord), vec2(0.0001));
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}
```

一句话解释：

`screenPxRange` 用来估算“MSDF 的有效距离范围，在当前屏幕上大约有多少像素宽”。

### 10.1 `unitRange`

```glsl
vec2 unitRange = vec2(u_DistanceRange) / u_AtlasSize;
```

它表示“距离场范围在 UV 空间里占多大”。

例如：

- `u_DistanceRange = 4`
- `u_AtlasSize = (256, 256)`

则：

```text
unitRange = (4/256, 4/256)
```

这表示“距离场里那段有意义的范围”，在整张 atlas 中对应的 UV 宽度。

### 10.2 `screenTexSize`

```glsl
vec2 screenTexSize = vec2(1.0) / max(fwidth(texcoord), vec2(0.0001));
```

因为 `fwidth(texcoord)` 表示“1 像素覆盖多少 UV”，  
那么它的倒数就表示：

- 1 个 UV 单位大概对应多少屏幕像素

也可以理解成“当前纹理被放大了多少”。

### 10.3 为什么用 `dot`

```glsl
dot(unitRange, screenTexSize)
```

展开后：

```glsl
unitRange.x * screenTexSize.x +
unitRange.y * screenTexSize.y
```

这表示分别估算横向和纵向的屏幕像素范围，再把它们合起来。

### 10.4 为什么乘 `0.5`

因为 `dot(...)` 得到的是两个方向结果的和，而 shader 最后需要的是一个单一标量。

乘 `0.5` 后，相当于取平均：

```glsl
0.5 * (rangeX + rangeY)
```

如果不乘 `0.5`，结果会偏大，边缘过渡和描边宽度通常会显得偏厚。

### 10.5 为什么要 `max(..., 1.0)`

因为极小字号下，算出来的值可能很小，小到不足以稳定地表示一条边界过渡带。

把最小值钳到 `1.0`，可以让小字号时更稳，不容易闪。

## 11. `screenDistance` 到底是什么

核心公式：

```glsl
float screenDistance = screenPxRange(texcoord) * (sd - 0.5);
```

这是整套逻辑里最重要的一句。

它把两件事合在一起：

- `sd - 0.5`：相对边界的 signed distance
- `screenPxRange(texcoord)`：把它换算成屏幕像素尺度

于是 `screenDistance` 的意义就变成了：

- 当前片元离字形边界大约有多少屏幕像素

并且带符号：

- 正数：在字内
- 0：在边界
- 负数：在字外

这时 shader 才终于获得了真正有用的几何量。

## 12. 从距离到透明度

有了 `screenDistance`，接下来就可以把“几何距离”转成“显示透明度”。

当前 shader 用的是：

```glsl
float fillAlpha = clamp(screenDistance + 0.5, 0.0, 1.0);
```

它的含义是：

- `screenDistance <= -0.5`：完全透明
- `screenDistance >= 0.5`：完全不透明
- 中间线性过渡

数轴上可以画成这样：

```text
screenDistance:   ...  -1.0   -0.5    0.0    0.5    1.0  ...
fillAlpha:              0       0      0.5     1      1
```

这说明 shader 在边界附近保留了一条大约 1 像素宽的过渡带，用来做抗锯齿。

这就是距离场文字看起来平滑的直接原因。

## 13. 描边是怎么来的

当前 shader 用了两步：

```glsl
float strokeAlpha = clamp(screenDistance + outlineWidth + 0.5, 0.0, 1.0);
float outlineAlpha = max(strokeAlpha - fillAlpha, 0.0);
```

直觉上可以这样理解：

- `fillAlpha` 表示字本体
- `strokeAlpha` 表示“字本体加上向外扩张的一圈”
- 两者相减，就只剩描边环

也就是：

```text
描边 = 扩张后的整体区域 - 字本体
```

如果把它放到数轴上：

```text
screenDistance:

  -2.0   -1.5   -1.0   -0.5    0.0    0.5    1.0
    |------|------|------|------|------|------|

fillAlpha:
   0       0       0       0      0.5     1       1

strokeAlpha:
   0       0      0.5      1       1      1       1

outlineAlpha = strokeAlpha - fillAlpha:
   0       0      0.5      1      0.5     0       0
```

所以描边其实不是单独画一圈线，而是通过距离场把“外扩区域”算出来，再扣掉内部主体。

## 14. 为什么 MSDF 纹理不能按普通颜色贴图对待

MSDF 纹理的 `RGB` 存的是距离数据，不是显示颜色。

这意味着：

- 颜色空间转换会破坏它
- 不合适的压缩会破坏它
- 错误的采样流程会破坏它

尤其要注意 gamma/sRGB。

普通颜色贴图做 gamma 处理是合理的，因为人眼对亮度是非线性的。  
但 MSDF 不是颜色，它是数值场。数值场一旦被 gamma 扭曲，边界位置就会跟着偏移。

结果通常是：

- 字发虚
- 字变胖或变瘦
- 描边不稳定

所以 MSDF 纹理应该尽量按“原始数据”采样。

## 15. 当前项目里的 shader 是怎么落地这些原理的

当前实现的关键部分如下：

### 15.1 顶点阶段

```glsl
varying vec4 v_msdfFillColor;
varying vec4 v_msdfOutlineColor;
varying float v_msdfParams;

void main() {
    vertexInfo info;
    getVertexInfo(info);

    v_cliped = info.cliped;
    v_texcoordAlpha = info.texcoordAlpha;
    v_useTex = info.useTex;
    v_color = info.color;
    v_msdfFillColor = a_msdfFillColor;
    v_msdfOutlineColor = a_msdfOutlineColor;
    v_msdfParams = a_msdfParams;

    vec4 pos;
    getPosition(pos);
    gl_Position = pos;
}
```

顶点阶段做的事很简单：

- 传 UV
- 传裁剪信息
- 传填充色
- 传描边色
- 传描边宽度
- 计算最终顶点位置

真正的“重建字形边界”不在顶点阶段，而在片元阶段。

### 15.2 片元阶段

```glsl
float median3(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float screenPxRange(vec2 texcoord) {
    vec2 unitRange = vec2(u_DistanceRange) / u_AtlasSize;
    vec2 screenTexSize = vec2(1.0) / max(fwidth(texcoord), vec2(0.0001));
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

void main() {
    clip();

    vec2 texcoord = v_texcoordAlpha.xy;
    vec3 msdf = texture2D(u_spriteTexture, texcoord).rgb;
    float sd = median3(msdf.r, msdf.g, msdf.b);
    float screenDistance = screenPxRange(texcoord) * (sd - 0.5);

    vec4 fillColor = v_msdfFillColor;
    vec4 outlineColor = v_msdfOutlineColor;
    float outlineWidth = v_msdfParams;

    float fillAlpha = clamp(screenDistance + 0.5, 0.0, 1.0);
    float strokeAlpha = clamp(screenDistance + outlineWidth + 0.5, 0.0, 1.0);
    float outlineAlpha = max(strokeAlpha - fillAlpha, 0.0);

    vec4 color = outlineColor * outlineAlpha + fillColor * fillAlpha;
    setglColor(color);
}
```

把它按原理重新翻译一遍，就是：

1. 从 MSDF 纹理里取三通道距离信息
2. 用 `median3` 恢复一个稳定的距离值
3. 用 `sd - 0.5` 找到相对边界的位置
4. 用 `screenPxRange` 换算到屏幕像素尺度
5. 用 `fillAlpha` 算字本体透明度
6. 用 `strokeAlpha - fillAlpha` 算描边透明度
7. 用填充色和描边色合成最终输出

## 16. 最容易踩的坑

### 16.1 距离范围参数必须和生成 atlas 时一致

`u_DistanceRange` 或类似参数，必须和字体生成工具导出的距离范围匹配。

不一致时会直接导致：

- 字变胖
- 字变瘦
- 描边宽度不准
- 抗锯齿宽度异常

### 16.2 不要把 MSDF 当普通颜色图

MSDF 是数据图，不是颜色图。

### 16.3 `fwidth` 不能随便去掉

去掉以后：

- 大字号边缘会过硬
- 小字号会不稳定
- 不同缩放级别下观感会明显不一致

### 16.4 边界过渡宽度本质上是屏幕像素问题

很多人会直觉地把它当成“纹理空间里的阈值问题”，其实不是。

真正重要的是：

- 这个距离在当前屏幕上占多少像素

所以 `screenPxRange` 不是附属细节，而是 MSDF 在不同字号下保持稳定的关键。

## 17. 最后用一句话概括

MSDF 的本质不是“把字体画成彩色贴图”，而是：

- 在纹理中存边界距离
- 在 shader 中恢复几何意义上的边界
- 再根据当前屏幕缩放，把距离转成透明度和描边

其中最关键的一步是：

```glsl
float screenDistance = screenPxRange(texcoord) * (sd - 0.5);
```

因为它把“纹理里的距离编码”真正变成了“屏幕上的边界距离”。

