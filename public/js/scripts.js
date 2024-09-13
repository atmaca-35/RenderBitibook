document.addEventListener("DOMContentLoaded", async () => {
  const searchBox = document.getElementById("searchBox");
  const resultDiv = document.getElementById("result");
  const ghostText = document.getElementById("ghostText");
  const searchContainer = document.querySelector(".search-box");
  const wordCountElement = document.getElementById("wordCount");

  let dictionaryData = {};
  let hasError = false;
  let matchingWord = "";

  searchBox.addEventListener("input", async (e) => {
    const query = e.target.value.trim();

    ghostText.textContent = "";

    if (!hasError) {
      await searchWord(query);
      updateSearchBoxPlaceholder(query);
    } else {
      searchContainer.classList.add("error");
    }
  });

  searchBox.focus();

  document.querySelector("#result").addEventListener("click", (e) => {
    if (e.target.classList.contains("searchable")) {
      searchBox.value = e.target.textContent;
      searchBox.dispatchEvent(new Event("input"));
    }
  });

  try {
    if (window.location.hash.length > 1) {
      const hash = window.location.hash.substring(1);

      searchBox.value = decodeURIComponent(hash);

      const response = await searchWord(decodeURIComponent(hash));

      updateSearchBoxPlaceholder(decodeURIComponent(hash));

      if (response) {
        matchingWord = response.word;
      }
    }

    const vocabularyResponse = await fetch("/js/vocabulary.json");
    if (!vocabularyResponse.ok) {
      throw new Error("Oops!");
    }

    dictionaryData = await vocabularyResponse.json();

    const wordCount = await fetchWordsCount();

    wordCountElement.innerHTML = `Portrait of Proto-Turkic in <span class="highlight">${wordCount}</span> Entries.`;
    searchContainer.classList.remove("error");
    return true;
  } catch (error) {
    console.error("Oops!", error);
    hasError = true;
    wordCountElement.innerHTML = `<p class="error-message">Oops!</p>`;
    searchContainer.classList.add("error");
    resultDiv.classList.add("hidden");
    ghostText.classList.add("hidden");
    return false;
  }

  async function searchWord(query) {
    query = query.trim();

    resultDiv.innerHTML = "";

    if (query.startsWith(" ") || query.trim().length === 0) {
      if (query.length === 0) {
        searchContainer.classList.remove("error");
        ghostText.textContent = "";
        return;
      }
      searchContainer.classList.add("error");
      ghostText.textContent = "";
      return;
    } else {
      searchContainer.classList.remove("error");
    }

    const normalizedQuery = normalizeTurkish(query);

    const words = await searchWordInDatabase(query);

    const sortedWords = words.sort((a, b) => a.word.localeCompare(b.word));

    const closestWord = sortedWords.find(({ word }) =>
      word.startsWith(normalizedQuery)
    );

    if (closestWord) {
      matchingWord = closestWord.word;
    } else {
      matchingWord = "";
      ghostText.textContent = "";
      searchContainer.classList.add("error");

      return;
    }

    const occurrence = {};

    let n = words.length;

    for (let i = 0; i < n; i++) {
      const w = words[i];

      if (!occurrence[w._id]) {
        const descriptionElement = document.createElement("div");

        descriptionElement.innerHTML += `<h3 class="word-title">${w.word}</h3>`;

        descriptionElement.id = w._id;

        descriptionElement.classList.add("word-container");

        descriptionElement.innerHTML += w.description;

        const related = w.related_words.filter((w) => w != w.word);

        let n = related.length;

        if (n) {
          descriptionElement.innerHTML += `</br>`;
          descriptionElement.innerHTML += `</br>`;

          descriptionElement.innerHTML += `See `;

          for (let i = 0; i < n; i++) {
            const word = w.related_words[i];

            descriptionElement.innerHTML += `<span class=${
              window.location.hash.substring(1) != word ? "searchable" : ""
            }>${word}</span>
                 ${i + 1 != n ? "<span>,</span>" : ""}
                `;
          }
        }

        resultDiv.style.animation = "fadeIn 1s ease-in-out";

        resultDiv.appendChild(descriptionElement);

        ghostText.textContent = closestWord.word.substring(query.length);
      }

      occurrence[w._id] = true;
    }

    resultDiv.style.animation = "none";
    resultDiv.offsetHeight;
    resultDiv.style.animation = "fadeIn 1s ease-in-out";

    createClickableWords();

    return closestWord;
  }

  function createClickableWords() {
    if (dictionaryData.clickableWords) {
      Object.keys(dictionaryData.clickableWords).forEach((key) => {
        const clickableWords = dictionaryData.clickableWords[key];
        const regex = new RegExp(
          `(${key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")})`,
          "gi"
        );
        resultDiv.innerHTML = resultDiv.innerHTML.replace(
          regex,
          `<span class="clickable-word" style="color: #e9d677; cursor: pointer;">$1</span>`
        );
      });

      const clickableElements = document.querySelectorAll(".clickable-word");
      clickableElements.forEach((element) => {
        element.addEventListener("click", function () {
          const word = this.textContent;
          this.style.textDecoration = "underline";
          showWordMeanings(word, this);
        });
      });
    }
  }

  function showWordMeanings(word, element) {
    const clickableWords = dictionaryData.clickableWords[word] || [];

    const existingTooltips = document.querySelectorAll(".tooltip");
    existingTooltips.forEach((tooltip) => tooltip.remove());

    if (clickableWords.length > 0) {
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      const random = Math.floor(Math.random() * clickableWords.length);
      let meaning = "";
      clickableWords[random].forEach(
        (tempMeaning) => (meaning += tempMeaning + "<br>")
      );
      tooltip.innerHTML = meaning;

      document.body.appendChild(tooltip);

      const elementRect = element.getBoundingClientRect();
      tooltip.style.position = "absolute";
      tooltip.style.display = "block";

      const tooltipRect = tooltip.getBoundingClientRect();
      let top = elementRect.top + window.scrollY - tooltipRect.height - 5;
      let left =
        elementRect.left +
        window.scrollX +
        elementRect.width / 2 -
        tooltipRect.width / 2;

      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 5;
      }
      if (left < 0) {
        left = 5;
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      tooltip.style.opacity = 0;
      tooltip.style.transition = "opacity 0.3s ease-in-out";
      setTimeout(() => {
        tooltip.style.opacity = 1;
      }, 50);

      element.addEventListener("mouseleave", function () {
        tooltip.style.opacity = 0;
        setTimeout(() => {
          tooltip.remove();
          element.style.textDecoration = "none";
        }, 300);
      });
    }
  }

  function normalizeTurkish(text) {
    return text.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
  }

  function updateSearchBoxPlaceholder(query) {
    if (!query) {
      ghostText.textContent = "";
      matchingWord = "";
      return;
    }

    if (matchingWord) {
      const remainingPart = matchingWord.substring(query.length);

      ghostText.textContent = remainingPart;

      const inputRect = searchBox.getBoundingClientRect();
      const inputStyle = window.getComputedStyle(searchBox);
      const paddingLeft = parseFloat(inputStyle.paddingLeft);
      const fontSize = parseFloat(inputStyle.fontSize);

      const firstCharWidth = getTextWidth(query, fontSize);
      ghostText.style.left = `${paddingLeft + firstCharWidth}px`;

      // Make sure to show space correctly in ghost text
      ghostText.style.whiteSpace = "pre"; // Preserve spaces in ghost text
    } else {
      ghostText.textContent = "";
    }
  }

  function getTextWidth(text, fontSize) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${fontSize}px 'Poppins', sans-serif`;
    return context.measureText(text).width;
  }
});
