---
layout: post
title: 这个 Jekyll 站点的魔改功能与维护说明
categories: 技术
tags:
  - Jekyll
  - GitHub Pages
---

这份草稿记录本仓库在标准 Jekyll 博客之外增加的功能，以及新增文章或调整部署时需要知道的用法。以当前仓库代码为准；未实际启用或已经过时的配置会特别标出。

<!--more-->

## 本地预览

安装 Ruby/Bundler 后，在仓库根目录执行：

```powershell
bundle install
bundle exec jekyll serve --drafts
```

`--drafts` 会同时构建 `_drafts/` 中没有日期文件名的文章，适合预览这类草稿。普通文章仍放在 `_posts/YYYY-MM-DD-name.md`。

站点目前使用 Jekyll 4、Kramdown（GFM 输入格式）和 `jekyll-paginate`：

- 文章永久链接是 `/blog/post/:title/`。这里的 `:title` 来自文件名中日期之后的部分，而不是 front matter 的 `title`。
- 首页每页 7 篇，第二页起地址为 `/blog/index/:num`。
- `<!--more-->` 是摘要分隔符；首页会在它前面截断摘要。
- `timezone: Asia/Shanghai` 会影响 front matter 中日期的解析和显示。

## 写文章时可用的 front matter

### 默认字段与列表行为

所有 `_posts` 中的文章会自动得到 `is_post: true`，因此右侧栏会显示文章专属的版权说明和评论区导航。分类、标签和置顶由下列字段控制：

```yaml
---
layout: post
title: 文章标题
date: 2026-11-06 13:00:00 +0800
categories: 技术
tags:
  - javascript
  - Jekyll
is_sticky: true
issue: 123
---
```

- `categories`：驱动 `/type` 的分类标签和页头“分类”菜单。分类为 `sticky` 时会被菜单隐藏；不要把它当作置顶开关。
- `tags`：驱动 `/tag` 页面及右侧的 TagCloud 标签云。
- `is_sticky: true`：在分类列表的“所有文章”区域优先显示该文章。
- `issue`：关联 GitHub Issue 评论，详见后文。没有此字段时页面会显示“评论已关闭”。

### 按需加载的渲染功能

为避免每个页面都加载大型脚本，`_includes/head.html` 依据页面字段选择性加载功能。需要时在文章 front matter 中设置：

```yaml
use_code: true
use_math: true
use_mermaid: true
```

| 字段 | 实际效果 | 使用方式 |
| --- | --- | --- |
| `use_code` | 加载 Highlight.js 和 Docco 主题 | 用 fenced code block，并在语言名后标注语言，例如 <code>```js</code>。 |
| `use_math` | 加载 MathJax 4.1.3 的 TeX/MathML CommonHTML 组件 | 用 `$...$` 写行内公式，或 `$$...$$` 写独立公式。 |
| `use_mermaid` | 加载 Mermaid 12.3.0 并显式渲染 `.language-mermaid` | 用 <code>```mermaid</code> fenced block 写图。 |

Kramdown 还支持两项模板中已经使用的语法：

```markdown
[在新窗口打开](https://example.com/){:target="_blank"}

| 无表头第一行 | 无表头第二列 |
| --- | --- |
| 内容 | 内容 |
```

`_drafts/post_module.md` 是可复制的文章模板，包含上述字段与示例。

## MathJax 与 Mermaid：当前版本和升级方式

两项库均由页面 front matter 按需加载，并在模板中使用精确版本号，而不是 `@latest`。这样构建结果可复现；升级时应同时更新本节和模板 URL。

| 库 | 当前版本 | 配置位置 | 浏览器加载方式 |
| --- | --- | --- | --- |
| MathJax | 4.1.3 | `_includes/head.html` | `defer` 加载 `tex-mml-chtml.js`。 |
| Mermaid | 12.3.0 | `_includes/footer.html` | `type="module"` 导入 `mermaid.esm.min.mjs`。 |

### MathJax 4.1.3

`use_math: true` 时，`_includes/head.html` 会**先**设置 `window.MathJax`，再加载 MathJax：

```html
<script>
  window.MathJax = {
    tex: {
      inlineMath: {'[+]': [['$', '$']]}
    }
  };
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@4.1.3/tex-mml-chtml.js"></script>
```

这保留了原站点使用 `$...$` 写行内公式的习惯；`$$...$$` 仍用于独立公式。`tex-mml-chtml` 同时包含 TeX、MathML 输入和 CommonHTML 输出，以及常用 TeX 扩展。

升级 MathJax 时：

1. 在 `_includes/head.html` 的 CDN URL 中同时替换版本号，并保持配置脚本位于库脚本之前。
2. 不要沿用 MathJax 2 的 `MathJax.js?config=...` URL 格式；v3/v4 直接加载对应组件文件。
3. 运行 `bundle exec jekyll build`，并打开 `/blog/post/40/`，确认页面中存在 `mjx-container` 且既有 `$$...$$` 公式渲染正常。

### Mermaid 12.3.0

`use_mermaid: true` 时，`_includes/footer.html` 在页面末尾导入模块并显式处理 Kramdown 为 fenced block 生成的 `.language-mermaid` 节点：

```html
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.esm.min.mjs";

  mermaid.initialize({startOnLoad: false, theme: "default"});
  await mermaid.run({nodes: document.querySelectorAll(".language-mermaid")});
</script>
```

文章中继续使用下列 Markdown，不要手动写 `<pre class="mermaid">`：

````markdown
```mermaid
flowchart LR
  A[开始] --> B[结束]
```
````

`startOnLoad: false` 很重要：页面并不使用 Mermaid 默认查找的 `.mermaid` 节点，而是将 Kramdown 输出的 `.language-mermaid` 节点交给 `mermaid.run()`。升级 Mermaid 时，保持这两个设置以及 `nodes` 选择器；不要恢复已废弃的 `mermaid.init()`。完成后运行 `bundle exec jekyll build` 并打开 `/blog/post/101/`，确认 `.language-mermaid` 内生成 SVG。

Mermaid 12 的官方浏览器基线为 Safari 17.4；若仍需支持更旧浏览器，应先评估保留当前版本或自行转译/提供 polyfill。

## 搜索：Pagefind 的构建后索引

搜索并不是 Jekyll 插件，而是 GitHub Actions 在静态站点构建完毕后运行 Pagefind：

1. `actions/jekyll-build-pages@v1` 构建 `_site`。
2. 工作流下载并解压 `pagefind_extended`。
3. 它只索引 `blog/post/**/*.html`，并排除 `img.emoji`。
4. `search.html` 通过动态 import `/pagefind/pagefind.js` 搜索，结果显示在搜索页。

文章布局已在 `<main>` 上设置 `data-pagefind-body`，标题通过 `data-pagefind-meta="title"` 写入索引。右侧栏设置了 `data-pagefind-ignore="all"`，避免最新文章、标签和友情链接污染正文搜索结果。

要让部署成功，需要在仓库的 **Settings → Secrets and variables → Actions → Variables** 中维护：

| 变量 | 含义 |
| --- | --- |
| `PAGEFIND_VERSION` | Pagefind GitHub Release 的版本号。 |
| `PAGEFIND_PACKAGE_NAME` | 下载包文件名；必须与该版本 Release 中的 Linux 压缩包名称一致，解压后还必须包含可执行文件 `pagefind_extended`。 |

修改文章不需要手动生成索引，推送到 `master` 后工作流会重新构建。若搜索页报 `Failed to fetch dynamically imported module` 或没有结果，优先检查该工作流的 **Index pagefind** 步骤、两项 Actions Variable，以及文章是否输出到 `/blog/post/`。

## GitHub Issue 评论与旧评论迁移

评论系统不是 Disqus/Giscus，而是仓库内的自定义 JavaScript：

- `_includes/head.html` 初始化 `GithubComments`，用于 GitHub OAuth 登录、读取/提交 Issue 评论和 GitHub Emoji。
- `_includes/comments.html` 依据 `page.issue` 决定是否显示提交框，并用该 Issue 编号拉取评论。
- `js/git-comments-count.js` 在首页等列表页汇总 Issue 评论数。
- `js/old-comments.js` 保存历史评论数据；页面同时展示旧评论数，以支持迁移前内容。

为一篇新文章启用评论：

1. 在 `JiYouMCC/JiYouMCC.github.io` 创建一个对应的 GitHub Issue。
2. 将 Issue 编号填入文章的 `issue` 字段，例如 `issue: 123`。
3. 部署后检查文章页是否能读取评论、列表页是否显示评论数。

留言页 `guestbook.html` 也使用同一机制，但目前固定关联 `issue: 3`。不要随意复用同一个 Issue 编号，否则不同文章会显示和写入同一串评论。若登录跳转或提交失败，应检查 GitHub OAuth App 的回调地址和 `_includes/head.html` 中的初始化配置；不要把 OAuth client secret 放进静态仓库。

## 相册：用静态文件和目录名驱动

`_config.yml` 为路径 `photo` 下的静态文件赋予 `photo: true`。`photos.html` 从 `site.static_files` 过滤出这些文件，再交给 `js/photos.js` 按目录显示文件夹和图片。

因此新增相册图片时，请放到 `photo/` 目录或其子目录，例如：

```text
photo/
  2026-shanghai/
    001.jpg
    002.jpg
```

不要把图片放进 `photos/`：站点页面名称是 `photos.html`，但被 Jekyll 标记和扫描的资源路径是 `photo/`。相册页的 hash 可用于直达某个文件夹，脚本会读取 `#` 后的目录名。

## `_data` 驱动的导航项

这些 YAML 文件不需要改模板，改数据即可更新站点导航：

| 文件 | 用途 | 常用字段 |
| --- | --- | --- |
| `_data/tools.yml` | 顶部“工具”下拉菜单 | `name`、`title`、`href`、`blank: true`；`divider: true` 插入分隔线。 |
| `_data/links.yml` | 右侧“链接”卡片 | `title`、`href`；可选 `src`，有图片时显示图片链接。 |
| `_data/ref.yml` | 页脚参考链接 | `title`、`href`。 |

站内路径通常以 `/` 开头。当前模板中还有若干硬编码的根路径（例如 `/search/`、`/tag/`），因此若将 `baseurl` 改为非空子路径，需连同这些模板链接一起调整并完整回归检查。

## 其他定制组件

- **Bootstrap 5 与 Feather Icons**：本地文件在 `bootstrap/`、`lib/feather.min.js`；`footer.html` 的 `feather.replace()` 会把页面中的 `<i data-feather="...">` 替换为 SVG 图标。
- **标签云**：`_includes/right.html` 使用 `lib/TagCloud.min.js`，点击标签会跳转至 `/tag/#标签名` 并激活对应列表。
- **文章页悬浮导航**：`js/affix.js` 根据文章和评论区域动态生成悬浮操作按钮，仅桌面宽度显示。
- **RSS 链接**：模板链接到 `/feed.xml`，但当前 `Gemfile`/`_config.yml` 未显式声明 `jekyll-feed`。部署后若该地址不存在，应添加并配置该插件，而不是只改页面链接。

## 配置漂移与维护注意事项

以下内容值得保留，但在升级时应先确认是否仍然生效：

1. `_config.yml` 同时有旧式 `gems:` 和新式 `plugins:`。`plugins:` 只列出了 `jekyll-paginate`，而 `gems:` 还列出了 `jemoji` 和 `jekyll-sitemap`。Jekyll 4 应优先统一维护 `plugins:`，并在改动后执行本地构建及查看 Pages 构建日志。
2. `Gemfile` 直接声明了 `gemoji`、`jekyll-paginate` 和 Jekyll 4，但没有显式声明配置中出现的 `jemoji`、`jekyll-sitemap` 或 RSS 所需的 `jekyll-feed`。不要假定 GitHub Pages 环境会补齐所有依赖。
3. `.travis.yml` 仍会执行 `bundle exec jekyll algolia`，但当前部署实际由 `.github/workflows/build_jekyll_with_pagefind.yml` 完成，仓库也没有对应的 Algolia 配置。除非要恢复 Travis/Algolia，否则将它视为历史配置。
4. MathJax 4.1.3 和 Mermaid 12.3.0 均通过 CDN 加载，且版本已固定在模板 URL 中。升级方式、模板配置和兼容性基线见“MathJax 与 Mermaid：当前版本和升级方式”。
5. Pagefind 的下载文件名由 GitHub Actions Variables 决定，而非版本自动推导；升级 Pagefind 时两项变量必须配套修改。

