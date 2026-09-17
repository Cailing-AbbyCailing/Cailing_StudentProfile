const defaultProfile = { // Default
  fullName: "Abegail P. Cailing",
  course: "BSIT",
  yearLevel: "3rd Year",
  aboutMe: "Hello! I’m Abegail P. Cailing, a BSIT student with a background in STEM and a deep interest in art, design, and web technology. My journey into IT stems from a desire to create and design that has a functional system.",
  skills: "HTML, CSS, JavaScript, Design"
};

const editBtn = document.getElementById('edit-profile-btn');
const cancelBtn = document.getElementById('cancel-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-profile-form');
const errorMsg = document.getElementById('error-message');

const nameInput = document.getElementById('input-name');
const courseInput = document.getElementById('input-course');
const yearInput = document.getElementById('input-year');
const aboutInput = document.getElementById('input-about');
const skillsInput = document.getElementById('input-skills');

const headerName = document.getElementById('header-name');
const displayName = document.getElementById('display-name');
const displayCourse = document.getElementById('display-course');
const displayYear = document.getElementById('display-year');
const displayAbout = document.getElementById('display-about');
const displaySkills = document.getElementById('display-skills');

function loadProfile() {
  const savedData = localStorage.getItem('studentProfile');
  const profile = savedData ? JSON.parse(savedData) : defaultProfile;

  if (headerName) headerName.textContent = profile.fullName;
  if (displayName) displayName.textContent = profile.fullName;
  if (displayCourse) displayCourse.textContent = profile.course;
  if (displayYear) displayYear.textContent = profile.yearLevel;
  if (displayAbout) displayAbout.textContent = profile.aboutMe;
  if (displaySkills) displaySkills.textContent = profile.skills;
}

function openModal() {
  const savedData = localStorage.getItem('studentProfile');
  const profile = savedData ? JSON.parse(savedData) : defaultProfile;

  if (nameInput) nameInput.value = profile.fullName;
  if (courseInput) courseInput.value = profile.course;
  if (yearInput) yearInput.value = profile.yearLevel;
  if (aboutInput) aboutInput.value = profile.aboutMe;
  if (skillsInput) skillsInput.value = profile.skills;

  if (errorMsg) errorMsg.classList.add('hidden');
  if (editModal) editModal.classList.remove('hidden');
}

function closeModal() {
  if (editModal) editModal.classList.add('hidden');
}

function saveProfile(event) {
  event.preventDefault(); // Prevents page reload

  const nameVal = nameInput ? nameInput.value.trim() : "";
  const courseVal = courseInput ? courseInput.value.trim() : "";
  const yearVal = yearInput ? yearInput.value.trim() : "";
  const aboutVal = aboutInput ? aboutInput.value.trim() : "";
  const skillsVal = skillsInput ? skillsInput.value.trim() : "";

  // Validation
  if (!nameVal || !courseVal || !yearVal || !aboutVal) {
    if (errorMsg) {
      errorMsg.textContent = "Please fill in all required fields.";
      errorMsg.classList.remove('hidden');
    } else {
      alert("Please fill in all required fields.");
    }
    return;
  }

  const updatedProfile = {
    fullName: nameVal,
    course: courseVal,
    yearLevel: yearVal,
    aboutMe: aboutVal,
    skills: skillsVal || "None listed"
  };

  localStorage.setItem('studentProfile', JSON.stringify(updatedProfile));  // Save to localStorage
  loadProfile(); // Update page display immediately
  closeModal();
}

if (editBtn) editBtn.addEventListener('click', openModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (editForm) editForm.addEventListener('submit', saveProfile);

// Close modal when clicking outside content box
if (editModal) {
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', loadProfile);