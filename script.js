const form = document.getElementById("wtpForm");
const descriptionInput = document.getElementById("description");
const resultCard = document.getElementById("resultCard");
const resultWord = document.getElementById("resultWord");
const resultDetail = document.getElementById("resultDetail");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const hintText = document.getElementById("hintText");
const typeInputs = Array.from(document.querySelectorAll('input[name="type"]'));
const submitButton = document.querySelector(".submit-btn");

function getSelectedType() {
  const selected = typeInputs.find((input) => input.checked);
  return selected ? selected.value : "word";
}

function setLoading(isLoading) {
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.textContent = "Finding...";
  } else {
    submitButton.disabled = false;
    submitButton.textContent = "Find it";
  }
}

function displayResult(phrase, explanation) {
  resultWord.textContent = phrase;
  resultDetail.textContent =
    explanation || "WTP returned a suggestion based on your description.";
  hintText.textContent =
    "If this looks right, tap Yes. If not, try adding more movie, emotion, or quote details.";
  resultCard.classList.remove("hidden");
}

function displayError(message) {
  resultWord.textContent = "Something went wrong.";
  resultDetail.textContent = message;
  hintText.textContent = "Check your connection or try again later.";
  resultCard.classList.remove("hidden");
}

async function handleSubmit(event) {
  event.preventDefault();
  const description = descriptionInput.value.trim();
  if (!description) {
    displayError(
      "Please describe what you remember so WTP can generate a better suggestion.",
    );
    return;
  }

  const payload = {
    type: getSelectedType(),
    description,
  };

  setLoading(true);
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      displayError(
        `API returned non-JSON response (${response.status}): ${text.slice(0, 220)}`,
      );
      return;
    }

    if (!response.ok) {
      displayError(data.error || `API error (${response.status}).`);
      return;
    }

    displayResult(data.phrase, data.explanation);
  } catch (error) {
    displayError(error.message || "Unable to reach the API.");
  } finally {
    setLoading(false);
  }
}

function handleFeedback(isYes) {
  hintText.textContent = isYes
    ? "Awesome — glad WTP helped! Enter another description and try again."
    : "Thanks for the feedback. Add a few more clues and WTP will try again.";
}

typeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    typeInputs.forEach((other) => {
      if (other !== input) other.checked = false;
    });
    if (!typeInputs.some((item) => item.checked)) {
      input.checked = true;
    }
  });
});

form.addEventListener("submit", handleSubmit);
yesButton.addEventListener("click", () => handleFeedback(true));
noButton.addEventListener("click", () => handleFeedback(false));
