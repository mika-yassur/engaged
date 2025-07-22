// Firebase Poll App - Modified to include follow-up response
document.addEventListener('DOMContentLoaded', function () {

  // ========================================
  // STEP 1: FIREBASE CONFIGURATION
  // ========================================
  const firebaseConfig = {
    apiKey: "AIzaSyAGID-adO2X_p97TkXpz--9394A0F1JxCo",
    authDomain: "engaged-eed28.firebaseapp.com",
    projectId: "engaged-eed28",
    storageBucket: "engaged-eed28.firebasestorage.app",
    messagingSenderId: "65457736500",
    appId: "1:65457736500:web:fb156c53febfdbb72eb361"
  };

  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // ========================================
  // STEP 2: GET REFERENCES TO HTML ELEMENTS
  // ========================================
  const yesButton = document.getElementById('vote-yes');
  const noButton = document.getElementById('vote-no');
  const yesCount = document.getElementById('yes-count');
  const noCount = document.getElementById('no-count');
  const totalVotes = document.getElementById('total-votes');
  const connectionStatus = document.getElementById('connection-status');

  const followUpContainer = document.getElementById('follow-up-container');
  const followUpInput = document.getElementById('follow-up-input');
  const followUpSubmit = document.getElementById('submit-follow-up');
  let currentVoteType = null; // will be 'yes' or 'no'

  // ========================================
  // STEP 3: REAL-TIME DATABASE LISTENERS
  // ========================================
  database.ref('poll/yes').on('value', function (snapshot) {
    const count = snapshot.val() || 0;
    yesCount.textContent = count;
    updateTotalVotes();
    console.log('Yes votes updated:', count);
  });

  database.ref('poll/no').on('value', function (snapshot) {
    const count = snapshot.val() || 0;
    noCount.textContent = count;
    updateTotalVotes();
    console.log('No votes updated:', count);
  });

  // ========================================
  // STEP 4: VOTE EVENT LISTENERS
  // ========================================
  yesButton.addEventListener('click', function () {
    currentVoteType = 'yes';
    castVote(currentVoteType);
    showFollowUp();
  });

  noButton.addEventListener('click', function () {
    currentVoteType = 'no';
    castVote(currentVoteType);
    showFollowUp();
  });

  function castVote(voteType) {
    const ref = database.ref(`poll/${voteType}`);
    ref.once('value')
      .then(snapshot => {
        const currentCount = snapshot.val() || 0;
        return ref.set(currentCount + 1);
      })
      .then(() => {
        console.log(`${voteType} vote recorded successfully`);
        showVoteConfirmation(voteType.charAt(0).toUpperCase() + voteType.slice(1));
      })
      .catch(error => {
        console.error('Error recording vote:', error);
        showError('Failed to record vote. Please try again.');
      });
  }

  // ========================================
  // STEP 5: FOLLOW-UP LOGIC
  // ========================================
  function showFollowUp() {
    followUpContainer.style.display = 'block';
    followUpInput.focus();
  }

  followUpSubmit.addEventListener('click', function () {
    const response = followUpInput.value.trim();
    if (!response) {
      alert('Please type something first!');
      return;
    }

    const timestamp = Date.now();
    database.ref(`followUps/${currentVoteType}/${timestamp}`).set({
      response: response
    })
      .then(() => {
        console.log('Follow-up saved');
        alert('Thanks for your response!');
        followUpInput.value = '';
        followUpContainer.style.display = 'none';
      })
      .catch(error => {
        console.error('Error saving follow-up:', error);
        showError('Could not save your response. Try again.');
      });
  });

  // ========================================
  // STEP 6: HELPER FUNCTIONS
  // ========================================
  function updateTotalVotes() {
    const yesVotes = parseInt(yesCount.textContent) || 0;
    const noVotes = parseInt(noCount.textContent) || 0;
    totalVotes.textContent = yesVotes + noVotes;
  }

  function showVoteConfirmation(vote) {
    const confirmation = document.createElement('div');
    confirmation.className = 'vote-confirmation';
    confirmation.textContent = `Thank you for voting "${vote}"!`;
    confirmation.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(confirmation);

    setTimeout(function () {
      confirmation.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(function () {
        if (confirmation.parentNode) {
          confirmation.parentNode.removeChild(confirmation);
        }
      }, 300);
    }, 3000);
  }

  function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
    `;
    document.body.appendChild(error);

    setTimeout(function () {
      if (error.parentNode) {
        error.parentNode.removeChild(error);
      }
    }, 5000);
  }

  // ========================================
  // STEP 7: CONNECTION STATUS
  // ========================================
  database.ref('.info/connected').on('value', function (snapshot) {
    const connected = snapshot.val();
    if (connected) {
      connectionStatus.innerHTML = '<p style="color: #4CAF50;">✅ Connected to Firebase</p>';
      console.log('Connected to Firebase');
    } else {
      connectionStatus.innerHTML = '<p style="color: #f44336;">❌ Disconnected from Firebase</p>';
      console.log('Disconnected from Firebase');
    }
  });

  // ========================================
  // STEP 8: INITIALIZATION
  // ========================================
  database.ref('poll').once('value')
    .then(function (snapshot) {
      if (!snapshot.exists()) {
        return database.ref('poll').set({ yes: 0, no: 0 });
      }
    })
    .then(function () {
      console.log('Poll initialized successfully');
    })
    .catch(function (error) {
      console.error('Error initializing poll:', error);
    });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  console.log('Firebase Poll App initialized successfully!');
});
