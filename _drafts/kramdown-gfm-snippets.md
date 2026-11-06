---
layout: post
title: Kramdown（GFM 模式）实用语法小抄
categories: 技术
tags:
  - Jekyll
  - Markdown
use_math: true
---

本仓库在 `_config.yml` 中使用 `kramdown` 的 `GFM` 输入模式。下列示例已用当前 Bundler 环境的 `kramdown 2.5.1` 与 `kramdown-parser-gfm 1.1.0` 验证。

<!--more-->

* TOC
{:toc}

## 属性列表：最实用的扩展
{: #attributes .text-primary}

属性列表（IAL）可为元素设置 `id`、CSS class 和 HTML 属性。

段落文字
{: .lead}

[新窗口链接](https://example.com){:target="_blank" rel="noopener"}

```markdown
## 标题
{: #custom-id .custom-class}

段落文字
{: .lead}

[新窗口链接](https://example.com){:target="_blank" rel="noopener"}
```

**注意：** 在 GFM 模式下，标题属性列表必须放在标题**下一行**。不要写成 `## 标题 {#custom-id}`，否则 `{#custom-id}` 会被当作标题正文。

## 自动目录

在文首写入下面两行，Kramdown 会按当前文档的标题生成目录：

```markdown
* TOC
{:toc}
```

生成的目录 `<ul>` 会带有 `id="markdown-toc"`，可通过 CSS 自定义样式。需要固定锚点时，使用上一节所示的标题属性列表。

## 脚注、定义列表和缩写

脚注示例：这句话需要补充说明[^source]。

术语
: 术语说明可以写在下一行，适合简短的名词解释。

*[HTML]: HyperText Markup Language

HTML 是常见的网页标记语言；上面的缩写定义会让它在输出中带有说明。

```markdown
脚注示例[^source]

[^source]: 脚注内容会集中显示在文末。

术语
: 术语说明

*[HTML]: HyperText Markup Language
```

[^source]: 脚注内容会集中显示在文末。

## GFM 的额外语法

- ~~这段文字会有删除线~~
- [x] 已完成任务
- [ ] 待办任务

```markdown
~~删除线~~

- [x] 已完成任务
- [ ] 待办任务
```

GFM 解析器默认启用 `hard_wrap`：普通段落中的单个换行也会输出为 `<br />`。因此想让两行仍属于同一段时，要像下面这样换行；想要新段落则留一个空行。

这一行后面直接换行。
这一行会紧接在上一行下面。

## 公式与围栏代码块

本主题对 `use_math: true` 的页面加载 MathJax，因此 Kramdown 输出的数学标记可直接使用：

行内公式：$E = mc^2$。

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

Mermaid 也继续使用 GFM 围栏代码块：

````markdown
```mermaid
flowchart LR
  A[开始] --> B[结束]
```
````

MathJax 与 Mermaid 的版本维护说明见仓库中的 `_drafts/jekyll-customizations-guide.md`。

