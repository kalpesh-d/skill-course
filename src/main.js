import { courseData } from "./courseData";

let player;
let currentVideoIndex = 0;

window.onYouTubeIframeAPIReady = () => initializePlayer();

function initializePlayer() {
  try {
    player = new YT.Player("player", {
      height: "100%",
      width: "100%",
      videoId: courseData.videos[0].videoId,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        fs: 1,
        controls: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        widget_referrer: window.location.href,
        cc_load_policy: 1,
        cc_lang_pref: "en",
        hl: "en",
        iv_load_policy: 3,
      },
      events: {
        onStateChange: onPlayerStateChange,
        onReady: onPlayerReady,
        onError: onPlayerError,
      },
    });
  } catch (error) {
    console.error("Error initializing player:", error);
    showToast("Error initializing video player. Please refresh the page.");
  }
}

function startCourse() {
  const enrollBtn = document.querySelector(".enroll-btn");
  const unenrollBtn = document.querySelector(".unenroll-btn");
  enrollBtn.textContent = "Continue Learning";
  enrollBtn.classList.add("enrolled");
  unenrollBtn.classList.add("visible");

  if (player && player.playVideo) {
    player.playVideo();
  }

  showToast("Welcome to the course! 🎉");
  localStorage.setItem("isEnrolled", "true");
  document
    .querySelector(".video-section")
    .scrollIntoView({ behavior: "smooth" });
}

function checkEnrollmentStatus() {
  const isEnrolled = localStorage.getItem("isEnrolled") === "true";
  const enrollBtn = document.querySelector(".enroll-btn");
  const unenrollBtn = document.querySelector(".unenroll-btn");

  if (isEnrolled) {
    enrollBtn.textContent = "Continue Learning";
    enrollBtn.classList.add("enrolled");
    unenrollBtn.classList.add("visible");
  } else {
    enrollBtn.textContent = "Start Learning";
    enrollBtn.classList.remove("enrolled");
    unenrollBtn.classList.remove("visible");
  }
}

function unenrollFromCourse() {
  if (
    confirm(
      "Are you sure you want to unenroll? This will reset all your progress."
    )
  ) {
    localStorage.removeItem("isEnrolled");
    localStorage.removeItem("courseProgress");
    localStorage.removeItem("videoNotes");
    courseData.videos.forEach((video) => (video.completed = false));

    const enrollBtn = document.querySelector(".enroll-btn");
    const unenrollBtn = document.querySelector(".unenroll-btn");
    enrollBtn.textContent = "Start Learning";
    enrollBtn.classList.remove("enrolled");
    unenrollBtn.classList.remove("visible");

    document.querySelector(".progress").style.width = "0%";
    document.querySelector(".progress-text").textContent = "0% Complete";
    document.getElementById("completedCount").textContent = "0/11";
    document.getElementById("timeRemaining").textContent = "3.5 hours";
    document.getElementById("userNotes").value = "";

    populateVideoList();
    showToast("Course progress has been reset");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function onPlayerReady() {
  try {
    document.querySelector(".video-container").classList.add("loaded");
    loadVideoSummary(0);
    loadQuizQuestion(0);
    populateVideoList();
    document
      .querySelector('.video-item[data-index="0"]')
      .classList.add("active");
  } catch (error) {
    console.error("Error in onPlayerReady:", error);
  }
}

function onPlayerError(event) {
  console.error("YouTube Player Error:", event.data);
  const errorMessages = {
    2: "Invalid video ID. Please try another video.",
    5: "HTML5 player error. Please try refreshing.",
    100: "Video not found or removed.",
    101: "Video playback not allowed.",
    150: "Video playback not allowed.",
  };
  showToast(
    errorMessages[event.data] || "Error loading video. Please try again."
  );
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    const currentVideoId = player.getVideoData().video_id;
    const videoIndex = courseData.videos.findIndex(
      (v) => v.videoId === currentVideoId
    );
    if (videoIndex !== -1) {
      markVideoAsCompleted(videoIndex, true);
      if (videoIndex < courseData.videos.length - 1) {
        setTimeout(() => {
          loadVideo(videoIndex + 1);
          showToast("Loading next video...");
        }, 1500);
      } else {
        showToast("🎉 Congratulations! You've completed all videos!");
      }
    }
  }
}

function populateVideoList() {
  const videoList = document.getElementById("videoList");
  videoList.innerHTML = courseData.videos
    .map(
      (video, index) => `
    <div class="video-item ${
      video.completed ? "completed" : ""
    }" data-index="${index}">
      <input type="checkbox" class="video-item-checkbox" ${
        video.completed ? "checked" : ""
      }>
      <div class="video-item-details">
        <h4>${video.title}</h4>
        <div class="video-item-meta">
          <span><i class="far fa-clock"></i> ${video.duration}</span>
          <span><i class="fas fa-eye"></i> ${video.views} views</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".video-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (!e.target.matches('input[type="checkbox"]')) {
        const index = parseInt(item.dataset.index);
        loadVideo(index);
      }
    });
  });

  document.querySelectorAll(".video-item-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();
      const index = parseInt(e.target.closest(".video-item").dataset.index);
      markVideoAsCompleted(index, e.target.checked);
    });
  });
}

function loadVideo(index) {
  if (!player) {
    console.error("YouTube player not initialized");
    showToast("Error: Video player not ready. Please refresh the page.");
    return;
  }

  const video = courseData.videos[index];
  document.querySelector(".video-container").classList.remove("loaded");

  try {
    player.loadVideoById({
      videoId: video.videoId,
      startSeconds: 0,
      suggestedQuality: "hd720",
    });

    document.querySelector(".current-video-title").textContent = video.title;
    document
      .querySelectorAll(".video-item")
      .forEach((item) => item.classList.remove("active"));
    document
      .querySelector(`.video-item[data-index="${index}"]`)
      .classList.add("active");

    document.querySelector(
      ".video-meta .views"
    ).innerHTML = `<i class="fas fa-eye"></i> ${video.views} views`;
    document.querySelector(
      ".video-meta .duration"
    ).innerHTML = `<i class="far fa-clock"></i> ${video.duration}`;

    document.querySelector(
      ".current-notes-title"
    ).textContent = `Notes for: ${video.title}`;
    currentVideoIndex = index;
    loadNotesForVideo(index);
    loadVideoSummary(index);
    loadQuizQuestion(index);
  } catch (error) {
    console.error("Error loading video:", error);
    showToast("Error loading video. Please try again.");
  }
}

function markVideoAsCompleted(index, forceState = null) {
  const newState =
    forceState !== null ? forceState : !courseData.videos[index].completed;
  courseData.videos[index].completed = newState;

  const videoItem = document.querySelector(
    `.video-item[data-index="${index}"]`
  );
  const checkbox = document.querySelector(
    `.video-item[data-index="${index}"] .video-item-checkbox`
  );

  if (newState) {
    videoItem.classList.add("completed");
    checkbox.checked = true;
    showToast("Video marked as completed! 🎉");
  } else {
    videoItem.classList.remove("completed");
    checkbox.checked = false;
    showToast("Video marked as unwatched");
  }

  saveProgress();
  updateProgress();
}

function saveProgress() {
  localStorage.setItem(
    "courseProgress",
    JSON.stringify(courseData.videos.map((v) => v.completed))
  );
}

function loadProgress() {
  const savedProgress = localStorage.getItem("courseProgress");
  if (savedProgress) {
    JSON.parse(savedProgress).forEach((completed, index) => {
      if (completed && index < courseData.videos.length) {
        courseData.videos[index].completed = true;
      }
    });
  }
}

function updateProgress() {
  const completedCount = courseData.videos.filter((v) => v.completed).length;
  const totalVideos = courseData.videos.length;
  const progress = (completedCount / totalVideos) * 100;

  document.querySelector(".progress").style.width = `${progress}%`;
  document.querySelector(".progress-text").textContent = `${Math.round(
    progress
  )}% Complete`;
  document.getElementById(
    "completedCount"
  ).textContent = `${completedCount}/${totalVideos}`;
  document.getElementById("timeRemaining").textContent = calculateRemainingTime(
    totalVideos - completedCount
  );

  document.querySelector(".cert-progress").style.width = `${progress}%`;
  document.getElementById("certProgressText").textContent = `${Math.round(
    progress
  )}%`;

  const certButton = document.getElementById("downloadCertificate");
  if (progress === 100) {
    certButton.disabled = false;
    document.querySelector(".certificate-info").textContent =
      "🎉 Congratulations! You can now download your certificate.";
  } else {
    certButton.disabled = true;
    document.querySelector(".certificate-info").textContent =
      "Complete all videos to unlock your certificate of completion.";
  }
}

function calculateRemainingTime(remainingVideos) {
  const totalMinutes = courseData.videos
    .slice(-remainingVideos)
    .reduce((acc, video) => {
      const [mins, secs] = video.duration.split(":");
      return acc + parseInt(mins) + parseInt(secs) / 60;
    }, 0);

  return totalMinutes < 60
    ? `${Math.round(totalMinutes)} minutes`
    : `${(totalMinutes / 60).toFixed(1)} hours`;
}

function loadQuizQuestion(videoIndex) {
  const quizContainer = document.getElementById("quizQuestions");
  const question =
    courseData.quizQuestions[videoIndex % courseData.quizQuestions.length];

  quizContainer.innerHTML = `
    <div class="quiz-question">
      <h4>${question.question}</h4>
      <div class="quiz-options">
        ${question.options
          .map(
            (option, idx) => `
          <label class="quiz-option">
            <input type="radio" name="quiz" value="${idx}">
            <span>${option}</span>
          </label>
        `
          )
          .join("")}
      </div>
      <button class="check-answer-btn">Check Answer</button>
    </div>
  `;

  quizContainer
    .querySelector(".check-answer-btn")
    .addEventListener("click", () => {
      const selected = quizContainer.querySelector(
        'input[name="quiz"]:checked'
      );
      if (selected) {
        const isCorrect = parseInt(selected.value) === question.correct;
        showToast(isCorrect ? "✅ Correct answer!" : "❌ Try again!");
      } else {
        showToast("Please select an answer!");
      }
    });
}

function setupNotesSystem() {
  const notesTextarea = document.getElementById("userNotes");
  const saveButton = document.getElementById("saveNotes");

  loadNotesForVideo(currentVideoIndex);

  setInterval(() => {
    const savedNotes = getNotesForVideo(currentVideoIndex);
    if (notesTextarea.value !== savedNotes) {
      saveNotesForVideo(currentVideoIndex, notesTextarea.value);
      showToast("Notes auto-saved");
    }
  }, 30000);

  saveButton.addEventListener("click", () => {
    saveNotesForVideo(currentVideoIndex, notesTextarea.value);
    showToast("Notes saved successfully! 📝");
  });
}

function saveNotesForVideo(videoIndex, notes) {
  const allNotes = JSON.parse(localStorage.getItem("videoNotes") || "{}");
  allNotes[videoIndex] = notes;
  localStorage.setItem("videoNotes", JSON.stringify(allNotes));
}

function getNotesForVideo(videoIndex) {
  const allNotes = JSON.parse(localStorage.getItem("videoNotes") || "{}");
  return allNotes[videoIndex] || "";
}

function loadNotesForVideo(videoIndex) {
  const notesTextarea = document.getElementById("userNotes");
  notesTextarea.value = getNotesForVideo(videoIndex);
}

function loadVideoSummary(index) {
  document.getElementById("video-summary").textContent =
    courseData.summaries[index] || "Loading summary...";
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function setupCaptionToggle() {
  const captionBtn = document.getElementById("toggleCaptions");
  let captionsEnabled = true;

  captionBtn.classList.add("active");

  captionBtn.addEventListener("click", () => {
    if (
      player &&
      player.getOptions &&
      player.getOptions().includes("captions")
    ) {
      captionsEnabled = !captionsEnabled;
      if (captionsEnabled) {
        player.loadModule("captions");
        player.setOption("captions", "track", { languageCode: "en" });
        captionBtn.classList.add("active");
      } else {
        player.unloadModule("captions");
        captionBtn.classList.remove("active");
      }
      showToast(captionsEnabled ? "Subtitles enabled" : "Subtitles disabled");
    }
  });
}

function generateCertificate() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 816;
  canvas.height = 1056;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 20;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  ctx.textAlign = "center";
  ctx.fillStyle = "#1e293b";

  ctx.font = "bold 48px Inter";
  ctx.fillText("Certificate of Completion", canvas.width / 2, 200);

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 100, 220);
  ctx.lineTo(canvas.width / 2 + 100, 220);
  ctx.stroke();

  ctx.font = "italic 24px Inter";
  ctx.fillText("This is to certify that", canvas.width / 2, 300);

  ctx.font = "bold 36px Inter";
  ctx.fillText("Web Development Student", canvas.width / 2, 380);

  ctx.font = "24px Inter";
  ctx.fillText("has successfully completed the course", canvas.width / 2, 440);

  ctx.font = "bold 36px Inter";
  ctx.fillText("Web Development Fundamentals", canvas.width / 2, 500);

  ctx.font = "20px Inter";
  ctx.fillText("Duration: 3.5 Hours | 11 Videos", canvas.width / 2, 550);

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.font = "24px Inter";
  ctx.fillText(`Completed on ${date}`, canvas.width / 2, 620);

  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 100, 800);
  ctx.lineTo(canvas.width / 2 + 100, 800);
  ctx.stroke();

  ctx.font = "italic 20px Inter";
  ctx.fillText("Course Instructor", canvas.width / 2, 830);

  try {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "web-development-certificate.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Certificate downloaded successfully! 🎉");
    }, "image/png");
  } catch (error) {
    console.error("Error generating certificate:", error);
    showToast("Error generating certificate. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  populateVideoList();
  setupNotesSystem();
  updateProgress();
  checkEnrollmentStatus();
  setupCaptionToggle();

  document.querySelector(".enroll-btn").addEventListener("click", startCourse);
  document
    .querySelector(".unenroll-btn")
    .addEventListener("click", unenrollFromCourse);
  document
    .getElementById("downloadCertificate")
    .addEventListener("click", generateCertificate);
});
