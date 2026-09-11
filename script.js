// Blacklisted words for automatic profanity filtering
const PROFANITY_LIST = ["badword", "abuse", "vulgar", "hate", "trash", "stupid"];

// 1. Company Search Filter (Index Page)
function filterCompanies() {
  const query = document.getElementById("companySearch").value.toLowerCase();
  const cards = document.querySelectorAll(".company-card");

  cards.forEach(card => {
    const name = card.getAttribute("data-name").toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
}

// 2. Modals Control (Free Advice)
function openModal(companyName) {
  document.getElementById("modalCompanyTitle").innerText = "Advise " + companyName;
  document.getElementById("adviceModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("adviceModal").style.display = "none";
}

function handleFreeAdviceSubmit(event) {
  event.preventDefault();
  alert("Thank you! Your advice has been submitted to the company.");
  closeModal();
}

// 3. Paid Bounties & Automatic Profanity Filter
function openBountySubmit(companyName, reward) {
  document.getElementById("bountyModalTitle").innerText = `Submit Report for ${companyName} (${reward})`;
  document.getElementById("bountyModal").style.display = "flex";
}

function closeBountyModal() {
  document.getElementById("bountyModal").style.display = "none";
  document.getElementById("alertMsg").innerText = "";
}

function handleBountySubmit(event) {
  event.preventDefault();
  const feedbackText = document.getElementById("bountyDetails").value.toLowerCase();
  const alertMsg = document.getElementById("alertMsg");

  // Check input against profanity list
  const containsProfanity = PROFANITY_LIST.some(word => feedbackText.includes(word));

  if (containsProfanity) {
    alertMsg.innerText = "Submission rejected: Contains profanity or vulgar language.";
    return;
  }

  alert("Bounty report successfully submitted for company review!");
  closeBountyModal();
}

// 4. Company Dashboard Actions
function markFixed(buttonElement) {
  const row = buttonElement.closest("tr");
  const statusCell = row.querySelector(".status");

  statusCell.innerText = "Fixed";
  statusCell.className = "status fixed";
  
  buttonElement.innerText = "Resolved";
  buttonElement.disabled = true;
}