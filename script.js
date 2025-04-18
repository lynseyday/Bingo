// Define the bingo card data (5x5 grid with your 25 tasks)
const bingoData = [
  ["Create or modify a morning routine", "Do something creative – try a new recipe, start a DIY, enjoy a craft", "Stretch for 10 minutes", "Write down who you need to forgive", "Ask for help"],
  ["Spend time in nature", "Laugh", "Engage in something that brings you joy", "Try something new", "Declutter a room or space"],
  ["Donate something you don’t use", "Unplug from technology 1 hour before bed", "Practice gratitude – write down 10 things you are grateful for", "Say 5 positive affirmations to yourself", "Complete a puzzle or brain game"],
  ["Set a personal goal and plan steps to achieve it", "Spend time with someone who makes you laugh", "Meditate for 10 minutes", "Curl up with a good book", "Have a dance party"],
  ["Enjoy an afternoon or evening out with friends or loved ones", "Talk through or journal your emotions", "Listen to your favorite song", "Watch your favorite movie or tv show", "Exercise for 30 minutes"]
];

// Generate the bingo card
const bingoCard = document.getElementById("bingo-card");

// Load saved progress from local storage
function loadProgress() {
  const savedProgress = JSON.parse(localStorage.getItem("bingoProgress")) || [];
  return savedProgress;
}

// Save progress to local storage
function saveProgress(progress) {
  localStorage.setItem("bingoProgress", JSON.stringify(progress));
}

// Initialize the bingo card
function initializeBingoCard() {
  const savedProgress = loadProgress();

  bingoData.forEach((row, rowIndex) => {
    row.forEach((task, colIndex) => {
      const square = document.createElement("div");
      square.classList.add("bingo-square");
      square.textContent = task;

      // Check if this square was previously marked
      const squareIndex = rowIndex * 5 + colIndex; // Calculate the square's index
      if (savedProgress[squareIndex]) {
        square.classList.add("marked"); // Restore marked state
      }

      // Mark the square when clicked
      square.addEventListener("click", () => {
        square.classList.toggle("marked"); // Toggle the "marked" class

        // Save the updated progress
        const updatedProgress = Array.from(document.querySelectorAll(".bingo-square")).map(square =>
          square.classList.contains("marked")
        );
        saveProgress(updatedProgress);
      });

      bingoCard.appendChild(square);
    });
  });
}

// Save the name to localStorage when the user types in the input box
const userInfoInput = document.getElementById("user-info");
userInfoInput.addEventListener("input", () => {
  localStorage.setItem("userName", userInfoInput.value.trim());
});

// Load the name from localStorage when the page loads
window.addEventListener("load", () => {
  const savedName = localStorage.getItem("userName");
  if (savedName) {
    userInfoInput.value = savedName; // Populate the input box with the saved name
  }
});

// Function to show the custom alert
function showCustomAlert(message) {
  const modal = document.getElementById("custom-alert");
  const messageElement = document.getElementById("alert-message");
  const closeButton = document.getElementById("close-alert");

  // Set the message
  messageElement.textContent = message;

  // Show the modal
  modal.style.display = "block";

  // Close the modal when the close button is clicked
  closeButton.onclick = () => {
    modal.style.display = "none";
  };

  // Close the modal when clicking outside the modal content
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

// Function to check for bingo
function checkBingo(markedSquares) {
  const size = 5; // 5x5 grid
  const rows = [];
  const cols = [];
  const diagonals = [[], []];

  // Organize rows, columns, and diagonals
  for (let i = 0; i < size; i++) {
    rows.push(markedSquares.slice(i * size, i * size + size)); // Add rows
    cols.push(markedSquares.filter((_, index) => index % size === i)); // Add columns
    diagonals[0].push(markedSquares[i * size + i]); // Add main diagonal
    diagonals[1].push(markedSquares[(i + 1) * size - (i + 1)]); // Add anti-diagonal
  }

  // Check if any row, column, or diagonal is fully marked
  const allLines = [...rows, ...cols, ...diagonals];
  return allLines.some(line => line.every(square => square)); // Return true if any line is fully marked
}

// Add event listener to the "Check for Bingo" button
document.getElementById("submit-button").addEventListener("click", () => {
  const userInfo = userInfoInput.value.trim(); // Get the value and trim whitespace

  // Validate the name input
  if (!userInfo) {
    showCustomAlert("Please enter your name before checking for bingo!");
    userInfoInput.focus(); // Highlight the input field
    return; // Stop further execution
  }

  // Get the bingo squares and check for bingo
  const squares = document.querySelectorAll(".bingo-square");
  const markedSquares = Array.from(squares).map(square => square.classList.contains("marked"));

  // Check for bingo
  const bingo = checkBingo(markedSquares);
  if (bingo) {
    showCustomAlert("Bingo achieved! Generating a PDF. Don't forget to attach the PDF to the email that will open!");

    // Capture the bingo card as an image using html2canvas
    const bingoCardElement = document.getElementById("bingo-card");
    html2canvas(bingoCardElement).then(canvas => {
      // Convert the canvas to a data URL (image)
      const imageData = canvas.toDataURL("image/png");

      // Generate a PDF using jsPDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();

      // Add the logo to the top-left of the PDF
      const logo = new Image();
      logo.src = "aornlogo.png"; // Replace with the path to your logo file
      logo.onload = () => {
        pdf.addImage(logo, "PNG", 10, 10, 30, 10); // Adjust dimensions (x, y, width, height)

        // Add the title below the logo
        pdf.setFontSize(18);
        pdf.text("Mental Health Bingo Card", 105, 25, { align: "center" }); // Centered title

        // Add "Submitted by:" and the user's name below the title
        pdf.setFontSize(12); // Smaller font for the submitted name
        pdf.text(`Submitted by: ${userInfo}`, 105, 35, { align: "center" }); // Centered below the title

        // Add the bingo card image to the PDF
        pdf.addImage(imageData, "PNG", 10, 50, 180, 160); // Adjust dimensions as needed
        pdf.save("bingo-card.pdf"); // Automatically downloads the PDF
      };
    });
  } else {
    showCustomAlert("No bingo yet, but don't worry your progress has been saved. Keep going!");
  }
});

// Add event listener to the "Reset Board" button
document.getElementById("reset-button").addEventListener("click", () => {
  // Clear all marked squares
  const squares = document.querySelectorAll(".bingo-square");
  squares.forEach(square => square.classList.remove("marked"));

  // Clear progress from local storage
  localStorage.removeItem("bingoProgress");

  // Alert the user that the board has been reset
  showCustomAlert("The bingo board has been reset!");
});

// Initialize the bingo card on page load
initializeBingoCard();
