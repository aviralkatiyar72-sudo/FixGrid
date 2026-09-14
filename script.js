// ===============================
// FIXGRID STATE
// ===============================

let activeCompanies =
  JSON.parse(localStorage.getItem("fixgrid_companies")) || [];

let currentUser =
  JSON.parse(localStorage.getItem("fixgrid_user")) || null;

let completedCount =
  parseInt(localStorage.getItem("fixgrid_completed")) || 0;

let totalEarnings =
  parseFloat(localStorage.getItem("fixgrid_earnings")) || 0;


// ===============================
// PAGE ELEMENTS
// ===============================

const pageHome =
  document.getElementById("page-home");

const pageBounties =
  document.getElementById("page-bounties");

const pageDashboard =
  document.getElementById("page-dashboard");

const navHome =
  document.getElementById("nav-home");

const navBounties =
  document.getElementById("nav-bounties");

const navDashboard =
  document.getElementById("nav-dashboard");


// ===============================
// AUTH ELEMENTS
// ===============================

const authModal =
  document.getElementById("auth-modal");

const loginView =
  document.getElementById("login-view");

const signupView =
  document.getElementById("signup-view");

const openLoginBtn =
  document.getElementById("open-login-btn");

const openSignupBtn =
  document.getElementById("open-signup-btn");

const closeModalBtn =
  document.getElementById("close-modal-btn");

const switchToSignup =
  document.getElementById("switch-to-signup");

const switchToLogin =
  document.getElementById("switch-to-login");

const logoutBtn =
  document.getElementById("logout-btn");

const authButtons =
  document.getElementById("auth-buttons");

const userProfile =
  document.getElementById("user-profile");

const userDisplayName =
  document.getElementById("user-display-name");


// ===============================
// DASHBOARD ELEMENTS
// ===============================

const statCompleted =
  document.getElementById("stat-completed");

const statEarnings =
  document.getElementById("stat-earnings");

const statStatus =
  document.getElementById("stat-status");


// ===============================
// COMPANY ELEMENTS
// ===============================

const companyList =
  document.getElementById("company-list");

const noCompanies =
  document.getElementById("no-companies");

const searchInput =
  document.getElementById("company-search");


// ===============================
// FORMS
// ===============================

const loginForm =
  document.getElementById("login-form");

const signupForm =
  document.getElementById("signup-form");


// ===============================
// CHAT ELEMENTS
// ===============================

const supportChat =
  document.getElementById("support-chat");

const chatCompanyName =
  document.getElementById("chat-company-name");

const closeChatBtn =
  document.getElementById("close-chat-btn");

const chatMessages =
  document.getElementById("chat-messages");

const chatInput =
  document.getElementById("chat-input");

const chatSendBtn =
  document.getElementById("chat-send-btn");

const chatOptions =
  document.getElementById("chat-options");

let selectedCompany = "";


// ===============================
// PAGE NAVIGATION
// ===============================

function switchPage(activeNav, activePage) {

  pageHome.classList.add("hidden");
  pageBounties.classList.add("hidden");
  pageDashboard.classList.add("hidden");

  navHome.classList.remove("active");
  navBounties.classList.remove("active");
  navDashboard.classList.remove("active");

  activePage.classList.remove("hidden");

  activeNav.classList.add("active");
}


navHome.addEventListener("click", function(e) {

  e.preventDefault();

  switchPage(navHome, pageHome);

});


navBounties.addEventListener("click", function(e) {

  e.preventDefault();

  switchPage(navBounties, pageBounties);

});


navDashboard.addEventListener("click", function(e) {

  e.preventDefault();

  switchPage(navDashboard, pageDashboard);

});


// ===============================
// AUTH MODAL
// ===============================

function openModal(view) {

  authModal.classList.add("active");

  if (view === "signup") {

    loginView.classList.add("hidden");
    signupView.classList.remove("hidden");

  } else {

    signupView.classList.add("hidden");
    loginView.classList.remove("hidden");

  }
}


function closeModal() {

  authModal.classList.remove("active");

}


openLoginBtn.addEventListener("click", function() {

  openModal("login");

});


openSignupBtn.addEventListener("click", function() {

  openModal("signup");

});


closeModalBtn.addEventListener(
  "click",
  closeModal
);


switchToSignup.addEventListener("click", function(e) {

  e.preventDefault();

  openModal("signup");

});


switchToLogin.addEventListener("click", function(e) {

  e.preventDefault();

  openModal("login");

});


authModal.addEventListener("click", function(e) {

  if (e.target === authModal) {

    closeModal();

  }

});


// ===============================
// CHAT SYSTEM
// ===============================

function openSupportChat(companyName) {

  selectedCompany = companyName;

  chatCompanyName.textContent =
    companyName + " Support";

  chatMessages.innerHTML = `
    <div class="bot-message">
      Hi! 👋
      <br><br>
      Welcome to FixGrid support for
      <strong>${companyName}</strong>.
      <br><br>
      How can we help you?
    </div>
  `;

  supportChat.classList.remove("hidden");

  chatInput.focus();

}


function closeSupportChat() {

  supportChat.classList.add("hidden");

  selectedCompany = "";

}


closeChatBtn.addEventListener(
  "click",
  closeSupportChat
);


// ===============================
// ADD USER MESSAGE
// ===============================

function addUserMessage(message) {

  const messageBox =
    document.createElement("div");

  messageBox.className =
    "user-message";

  messageBox.textContent =
    message;

  chatMessages.appendChild(messageBox);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;
}


// ===============================
// ADD BOT MESSAGE
// ===============================

function addBotMessage(message) {

  const messageBox =
    document.createElement("div");

  messageBox.className =
    "bot-message";

  messageBox.textContent =
    message;

  chatMessages.appendChild(messageBox);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;
}


// ===============================
// CHAT BOT RESPONSE
// ===============================

async function handleChatMessage(message) {

  try {

    const response = await fetch(
      "/ask",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          message: message,

          company: selectedCompany || "FixGrid"

        })
      }
    );


    const data =
      await response.json();


    if (data.success) {

      addBotMessage(
        data.reply
      );

    } else {

      addBotMessage(
        "❌ " +
        (
          data.reply ||
          "FixGrid could not process your message."
        )
      );

    }

  } catch (error) {

    console.error(
      "FixGrid Chat Error:",
      error
    );

    addBotMessage(
      "⚠️ FixGrid server se connection nahi ho pa raha."
    );

  }

}


// ===============================
// SEND CHAT MESSAGE
// ===============================

function sendChatMessage() {

  const message =
    chatInput.value.trim();

  if (!message) {

    return;

  }


  addUserMessage(message);

  chatInput.value = "";

  chatSendBtn.disabled = true;


  handleChatMessage(message)
    .finally(function() {

      chatSendBtn.disabled = false;

      chatInput.focus();

    });

}


chatSendBtn.addEventListener(
  "click",
  sendChatMessage
);


chatInput.addEventListener(
  "keydown",
  function(e) {

    if (e.key === "Enter") {

      e.preventDefault();

      sendChatMessage();

    }

  }
);


// ===============================
// QUICK CHAT OPTIONS
// ===============================

document
  .querySelectorAll(".chat-option")
  .forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const message =
          button.dataset.message;

        if (!message) {

          return;

        }


        addUserMessage(message);

        handleChatMessage(message);

      }
    );

  });


// ===============================
// COMPANY LIST
// ===============================

function renderCompanies(filterText = "") {

  companyList.innerHTML = "";

  const filtered =
    activeCompanies.filter(function(comp) {

      return comp.name
        .toLowerCase()
        .includes(
          filterText.toLowerCase()
        );

    });


  if (filtered.length === 0) {

    companyList.appendChild(noCompanies);

    noCompanies.classList.remove("hidden");

    return;

  }


  noCompanies.classList.add("hidden");


  filtered.forEach(function(comp) {

    const card =
      document.createElement("div");

    card.className =
      "company-card";


    card.innerHTML = `
      <h4>${comp.name}</h4>
      <span>● Online</span>
    `;


    card.addEventListener(
      "dblclick",
      function() {

        openSupportChat(comp.name);

      }
    );


    companyList.appendChild(card);

  });

}


// ===============================
// COMPANY SEARCH
// ===============================

searchInput.addEventListener(
  "input",
  function(e) {

    renderCompanies(
      e.target.value
    );

  }
);


// ===============================
// UPDATE UI
// ===============================

function updateUIState() {

  if (currentUser) {

    authButtons.classList.add("hidden");

    userProfile.classList.remove("hidden");

    userDisplayName.textContent =
      currentUser.name;

    statStatus.textContent =
      "Active Member";


    if (
      !activeCompanies.some(
        function(c) {

          return c.name.toLowerCase() ===
            currentUser.name.toLowerCase();

        }
      )
    ) {

      activeCompanies.push({
        name: currentUser.name
      });


      localStorage.setItem(
        "fixgrid_companies",
        JSON.stringify(
          activeCompanies
        )
      );

    }

  } else {

    authButtons.classList.remove("hidden");

    userProfile.classList.add("hidden");

    statStatus.textContent =
      "Guest";

  }


  statCompleted.textContent =
    completedCount;

  statEarnings.textContent =
    "$" +
    totalEarnings.toFixed(2);


  renderCompanies(
    searchInput.value
  );

}


// ===============================
// SIGNUP
// ===============================

signupForm.addEventListener(
  "submit",
  async function(e) {

    e.preventDefault();


    const name =
      document.getElementById(
        "signup-name"
      ).value.trim();

    const email =
      document.getElementById(
        "signup-email"
      ).value.trim();

    const password =
      document.getElementById(
        "signup-password"
      )?.value || "";


    try {

      const response =
        await fetch(
          "/api/signup",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              name: name,
              email: email,
              password: password
            })
          }
        );


      const data =
        await response.json();


      if (!data.success) {

        alert(
          data.message ||
          "Signup failed."
        );

        return;

      }


      currentUser =
        data.user;


      localStorage.setItem(
        "fixgrid_user",
        JSON.stringify(
          currentUser
        )
      );


      updateUIState();

      closeModal();

      signupForm.reset();


    } catch (error) {

      console.error(
        "Signup error:",
        error
      );

      alert(
        "Server se connection nahi ho pa raha."
      );

    }

  }
);


// ===============================
// LOGIN
// ===============================

loginForm.addEventListener(
  "submit",
  function(e) {

    e.preventDefault();


    const email =
      document.getElementById(
        "login-email"
      ).value.trim();


    const name =
      email.split("@")[0];


    currentUser = {

      name:
        name.charAt(0).toUpperCase() +
        name.slice(1),

      email: email

    };


    localStorage.setItem(
      "fixgrid_user",
      JSON.stringify(
        currentUser
      )
    );


    updateUIState();

    closeModal();

    loginForm.reset();

  }
);


// ===============================
// LOGOUT
// ===============================

logoutBtn.addEventListener(
  "click",
  function() {

    if (currentUser) {

      activeCompanies =
        activeCompanies.filter(
          function(c) {

            return c.name.toLowerCase() !==
              currentUser.name.toLowerCase();

          }
        );


      localStorage.setItem(
        "fixgrid_companies",
        JSON.stringify(
          activeCompanies
        )
      );

    }


    currentUser = null;


    localStorage.removeItem(
      "fixgrid_user"
    );


    updateUIState();

  }
);


// ===============================
// BOUNTY CLAIM
// ===============================

document
  .querySelectorAll(".claim-btn")
  .forEach(function(button) {

    button.addEventListener(
      "click",
      function(e) {

        if (!currentUser) {

          openModal("login");

          return;

        }


        const card =
          e.target.closest(".card");


        const reward =
          parseFloat(
            card.dataset.reward
          );


        completedCount += 1;

        totalEarnings += reward;


        localStorage.setItem(
          "fixgrid_completed",
          completedCount
        );


        localStorage.setItem(
          "fixgrid_earnings",
          totalEarnings
        );


        e.target.disabled = true;

        e.target.textContent =
          "Claimed";


        updateUIState();

      }
    );

  });


// ===============================
// START FIXGRID
// ===============================

updateUIState();