async function fetchWordsCount() {
  const request = await fetch("/words/count");

  const data = await request.json();

  return data.data;
}

async function searchWordInDatabase(word) {
  const request = await fetch(`/words/search?q=${word}`);

  const response = await request.json();

  return response.data;
}

async function directWordSearch(word) {
  const request = await fetch(`/words/direct/${word}`);

  const response = await request.json();

  return response.data;
}

async function saveWord({ user, word, description, related_words }) {
  const response = await fetch("/words/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user,
      word,
      description,
      related_words,
    }),
  });

  if (response.status == 201) {
    const result = await response.json();

    return result;
  }

  if (response.status < 500) {
    return response.status;
  }

  return 500;
}

async function updateWord(word, updatedFields) {
  const response = await fetch("/words/" + word, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...updatedFields }),
  });

  if (response.status == 201) {
    const result = await response.json();

    return result;
  }

  if (response.status < 500) {
    return response.status;
  }

  return 500;
}
