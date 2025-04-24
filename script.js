// Hey! This script makes a live markdown previewer work
document.addEventListener("DOMContentLoaded", () => {
  // Grab all the DOM elements we'll need
  const form = document.getElementById("markdown-form");
  const inputArea = document.getElementById("markdown-input");
  const previewArea = document.getElementById("markdown-preview");
  const copyButton = document.getElementById("copy-button");
  const clearButton = document.getElementById("clear-button");
  const themeToggleCheckbox = document.getElementById("checkbox");

  // Switch between light and dark theme
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (themeToggleCheckbox) {
      themeToggleCheckbox.checked = theme === "light";
    }
  }

  // Figure out which theme to use when the page loads
  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check if user's system prefers dark mode
      const prefersDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDarkMode ? "dark" : "light");

      // Listen for system theme changes
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("theme")) {
            setTheme(e.matches ? "dark" : "light");
          }
        });
    }
  }

  initializeTheme();

  // Toggle between light and dark themes when the switch is clicked
  themeToggleCheckbox.addEventListener("change", () => {
    const newTheme = themeToggleCheckbox.checked ? "light" : "dark";
    setTheme(newTheme);

    // Update mermaid diagrams if they exist
    if (typeof mermaid !== "undefined") {
      mermaid.initialize({
        startOnLoad: false,
        theme: newTheme === "dark" ? "dark" : "default",
      });

      renderMarkdown();
    }
  });

  // Set up the markdown parser options
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false,
    langPrefix: "language-",
  });

  // Store footnotes we find in the markdown
  let footnotes = {};

  // Make the textarea grow as you type
  function autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  autoResizeTextarea(inputArea);

  // Resize the textarea when window size changes
  window.addEventListener("resize", () => autoResizeTextarea(inputArea));

  // Load content on startup - either what's already there or a sample file
  if (inputArea.value) {
    renderMarkdown();
    autoResizeTextarea(inputArea);
  } else {
    // Try to load the sample markdown file
    fetch("sample.MD")
      .then((response) => {
        if (!response.ok) throw new Error("Sample file not found");
        return response.text();
      })
      .then((text) => {
        inputArea.value = text;
        renderMarkdown();
        autoResizeTextarea(inputArea);
      })
      .catch((error) => {
        console.log("No sample file loaded:", error);
      });
  }

  // The big function that converts markdown to HTML
  function renderMarkdown() {
    try {
      let markdownText = inputArea.value;

      if (typeof marked === "undefined") {
        throw new Error("marked library is not loaded");
      }

      footnotes = {};

      // Extract footnotes from the text
      markdownText = processFootnotes(markdownText);

      // Handle task lists (checkboxes)
      markdownText = markdownText.replace(
        /- \[([ x])\] (.*?)$/gm,
        (match, checked, text) => {
          const checkedAttr = checked === "x" ? "checked" : "";
          return `<div class="task-list-item"><input type="checkbox" ${checkedAttr} disabled> ${text}</div>`;
        }
      );

      // Convert markdown to HTML
      let htmlContent =
        typeof marked.parse === "function"
          ? marked.parse(markdownText)
          : marked(markdownText);

      // Handle footnote references in the text
      htmlContent = htmlContent.replace(/\[\^(\d+)\]/g, (match, id) => {
        return `<sup id="fnref-${id}" class="footnote-ref"><a href="#fn-${id}">[${id}]</a></sup>`;
      });

      // Add footnotes section at the bottom if we have any
      if (Object.keys(footnotes).length > 0) {
        htmlContent += '<div class="footnotes"><hr><ol>';

        Object.entries(footnotes)
          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
          .forEach(([id, content]) => {
            htmlContent += `<li id="fn-${id}" class="footnote">${content} <a href="#fnref-${id}" class="footnote-backref">↩</a></li>`;
          });

        htmlContent += "</ol></div>";
      }

      previewArea.innerHTML = htmlContent;

      // Render math equations if MathJax is available
      if (typeof MathJax !== "undefined") {
        if (typeof MathJax.Hub !== "undefined") {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, previewArea]);
        } else if (typeof MathJax.typesetPromise !== "undefined") {
          MathJax.typesetPromise([previewArea]).catch((err) => {
            console.error("Error typesetting math:", err);
          });
        }
      }

      // Render diagrams if mermaid is available
      if (typeof mermaid !== "undefined") {
        try {
          mermaid.init(
            undefined,
            document.querySelectorAll(".language-mermaid")
          );
        } catch (mermaidError) {
          console.error("Error initializing mermaid:", mermaidError);
        }
      }

      // Convert emoji shortcodes to actual emojis
      replaceEmojis();
    } catch (error) {
      console.error("Error rendering markdown:", error);
      previewArea.innerHTML =
        "<p>Error rendering markdown: " + error.message + "</p>";
    }
  }

  // Extract footnotes from the markdown text
  function processFootnotes(markdown) {
    return markdown.replace(/^\[\^(\d+)\]:\s+(.+)$/gm, (match, id, content) => {
      footnotes[id] = content.trim();
      return "";
    });
  }

  // Turn :emoji: codes into actual emoji icons
  function replaceEmojis() {
    const emojiMap = {
      ":smile:": "😊",
      ":heart:": "❤️",
      ":thumbsup:": "👍",
      ":rocket:": "🚀",
    };

    const elements = previewArea.querySelectorAll(
      "p, li, h1, h2, h3, h4, h5, h6"
    );
    elements.forEach((el) => {
      for (const [emoji, unicode] of Object.entries(emojiMap)) {
        el.innerHTML = el.innerHTML.replace(new RegExp(emoji, "g"), unicode);
      }
    });
  }

  // Set up all the interactive events

  // Update preview as you type (with a small delay)
  let debounceTimer;
  inputArea.addEventListener("input", function () {
    autoResizeTextarea(this);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderMarkdown, 500);
  });

  // Handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    renderMarkdown();
  });

  // Copy the generated HTML to clipboard
  copyButton.addEventListener("click", function () {
    const textToCopy = previewArea.innerHTML;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy HTML";
        }, 2000);
      })
      .catch((err) => {
        console.error("Error copying text to clipboard: ", err);
        copyButton.textContent = "Copy Failed";
        setTimeout(() => {
          copyButton.textContent = "Copy HTML";
        }, 2000);
      });
  });

  // Clear the editor and preview
  clearButton.addEventListener("click", function () {
    inputArea.value = "";
    previewArea.innerHTML =
      "<p class='empty-message'>Your preview will appear here</p>";
    autoResizeTextarea(inputArea);
  });
});
