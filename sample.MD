# Markdown Syntax Guide

This document provides examples of various Markdown elements and their syntax.

## Headers

# H1 Header

## H2 Header

### H3 Header

#### H4 Header

##### H5 Header

###### H6 Header

## Emphasis

_This text is italicized_
_This is also italicized_

**This text is bold**
**This is also bold**

**_This text is bold and italic_**
**_This is also bold and italic_**

~~This text is strikethrough~~

## Lists

### Unordered Lists

- Item 1
- Item 2
  - Nested Item 2.1
  - Nested Item 2.2
- Item 3

* Another way to make lists
* Using dashes
  - Nested item
  - Another nested item

### Ordered Lists

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

## Links

[Link text](https://www.example.com)

[Link with title](https://www.example.com "Example Website")

<https://www.example.com> (Automatic link)

## Blockquotes

> This is a blockquote
>
> > This is a nested blockquote
>
> Back to the first level

## Code

Inline code: `var example = "hello world";`

```javascript
// Code block with syntax highlighting
function sayHello() {
  console.log("Hello, world!");
}
```

## Horizontal Rules

---

---

---

## Tables

| Header 1 | Header 2 | Header 3 |
| -------- | :------: | -------: |
| Left     |  Center  |    Right |
| aligned  | aligned  |  aligned |
| text     |   text   |     text |

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Footnotes

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

## Escaping Characters

\*This text is surrounded by asterisks but not italicized\*

## Math Equations (GitHub Markdown)

When $a \ne 0$, there are two solutions to $ax^2 + bx + c = 0$ and they are
$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$$

## Diagrams (Mermaid syntax, supported in some Markdown renderers)

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

## Collapsible Sections (GitHub Markdown)

<details>
<summary>Click to expand!</summary>

This content is hidden until clicked.

</details>

## Emoji (GitHub Markdown)

:smile: :heart: :thumbsup: :rocket:

## HTML in Markdown

<div style="color: red;">
  This text is <b>bold</b> and <em>emphasized</em> using HTML tags.
</div>

---

_Last updated: April 22, 2025_
