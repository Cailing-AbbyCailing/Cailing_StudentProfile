// ==========================================
// 1. SUPABASE INITIALIZATION
// ==========================================
const SUPABASE_URL = "https://tiarkobcibqmqnyfjnbq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYXJrb2JjaWJxbXFueWZqbmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTgxMjIsImV4cCI6MjEwNjAzNDEyMn0.2b7RMBdV1RjEj_ce7b8Eyuq6igwNdbXqAhBctiGXKOg";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}
// ==========================================
// 2. DOM ELEMENTS
// ==========================================
let loginScreen, profileScreen, loginForm, loginError, logoutBtn, registerBtn, loginBtn;
let editBtn, cancelBtn, editModal, editForm, errorMsg, deleteAccountBtn;
let profileAvatar, changePhotoBtn, avatarContainer;
let nameInput, courseInput, yearInput, aboutInput, skillsInput;
let displayName, displayCourse, displayYear, displayAbout, displaySkills, displayStudentId;

function initDOMElements() {
  loginScreen = document.getElementById('login-screen');
  profileScreen = document.getElementById('profile-screen');
  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');
  logoutBtn = document.getElementById('logout-btn');
  registerBtn = document.getElementById('register-btn');
  loginBtn = document.getElementById('login-btn');

  editBtn = document.getElementById('edit-profile-btn');
  cancelBtn = document.getElementById('cancel-btn');
  editModal = document.getElementById('edit-modal');
  editForm = document.getElementById('edit-profile-form');
  errorMsg = document.getElementById('error-message');
  deleteAccountBtn = document.getElementById('delete-account-btn');

  profileAvatar = document.getElementById('profile-avatar');
  changePhotoBtn = document.getElementById('change-photo-btn');
  avatarContainer = document.getElementById('avatar-container');

  nameInput = document.getElementById('input-name');
  courseInput = document.getElementById('input-course');
  yearInput = document.getElementById('input-year');
  aboutInput = document.getElementById('input-about');
  skillsInput = document.getElementById('input-skills');

  displayName = document.getElementById('display-name');
  displayCourse = document.getElementById('display-course');
  displayYear = document.getElementById('display-year');
  displayAbout = document.getElementById('display-about');
  displaySkills = document.getElementById('display-skills');
  displayStudentId = document.getElementById('display-student-id');
}

// ==========================================
// 3. READ (Fetch profile from Supabase)
// ==========================================
async function loadProfile() {
  const currentStudentId = localStorage.getItem("loggedInStudentId");
  if (!currentStudentId) return;

  const { data, error } = await supabaseClient
    .from('students')
    .select('*')
    .eq('student_id', currentStudentId)
    .single();

  if (error || !data) {
    alert("Unable to fetch profile data from Supabase.");
    return;
  }

  if (displayName) displayName.textContent = data.full_name || "";
  if (displayCourse) displayCourse.textContent = data.course || "";
  if (displayYear) displayYear.textContent = data.year_level || "";
  if (displayAbout) displayAbout.textContent = data.about_me || "";
  if (displaySkills) displaySkills.textContent = data.skills || "";
  if (displayStudentId) displayStudentId.textContent = data.student_id || "";

  if (profileAvatar && data.profile_image) {
    profileAvatar.src = data.profile_image;
  }
}

// ==========================================
// 4. UPDATE (Save profile edits to Supabase)
// ==========================================
async function saveProfile(event) {
  event.preventDefault();

  const currentStudentId = localStorage.getItem("loggedInStudentId");
  const nameVal = nameInput ? nameInput.value.trim() : "";
  const courseVal = courseInput ? courseInput.value.trim() : "";
  const yearVal = yearInput ? yearInput.value.trim() : "";
  const aboutVal = aboutInput ? aboutInput.value.trim() : "";
  const skillsVal = skillsInput ? skillsInput.value.trim() : "";

  if (!nameVal || !courseVal || !yearVal || !aboutVal) {
    if (errorMsg) {
      errorMsg.textContent = "Please fill in all required fields.";
      errorMsg.classList.remove('hidden');
    }
    return;
  }

  const { error } = await supabaseClient
    .from('students')
    .update({
      full_name: nameVal,
      course: courseVal,
      year_level: yearVal,
      about_me: aboutVal,
      skills: skillsVal
    })
    .eq('student_id', currentStudentId);

  if (error) {
    alert("Error updating profile in Supabase: " + error.message);
  } else {
    alert("Profile updated successfully!");
    await loadProfile();
    closeModal();
  }
}

// ==========================================
// 5. CAMERA & IMAGE UPDATE (Supabase Direct Sync)
// ==========================================
function onCameraSuccess(imageData) {
  console.log("SUCCESS FUNCTION RUNNING");

  const imageSrc = imageData.startsWith('data:image')
    ? imageData
    : "data:image/jpeg;base64," + imageData;

  if (profileAvatar) {
    profileAvatar.src = imageSrc;
  }

  const currentStudentId = localStorage.getItem("loggedInStudentId");

  if (!currentStudentId) {
    alert("No logged-in student found.");
    return;
  }

  supabaseClient
    .from('students')
    .update({ profile_image: imageSrc })
    .eq('student_id', currentStudentId)
    .then(({ error }) => {
      if (error) {
        alert("Failed to save profile picture: " + error.message);
      } else {
        alert("Profile picture updated successfully!");
      }
    });
}

function onCameraError(message) {
  console.log("Camera error:", message);
  alert("Camera error: " + message);
}

function openCamera() {
  alert("STEP 1: Button clicked");

  if (!navigator.camera) {
    alert("STEP 2: Camera plugin NOT available.");
    return;
  }

  alert("STEP 2: Camera plugin is available.");

  const cameraOptions = {
    quality: 50,
    destinationType: 0,
    sourceType: 1,
    encodingType: 0,
    mediaType: 0,
    correctOrientation: true,
    saveToPhotoAlbum: false
  };

  alert("STEP 3: About to open camera.");

  navigator.camera.getPicture(
    function(imageData) {
      alert("STEP 4: Camera success!");

      const imageSrc = imageData.startsWith('data:image')
        ? imageData
        : "data:image/jpeg;base64," + imageData;

      if (profileAvatar) {
        profileAvatar.src = imageSrc;
      }

      const currentStudentId = localStorage.getItem("loggedInStudentId");

      if (!currentStudentId) {
        alert("No logged-in student found.");
        return;
      }

      supabaseClient
        .from('students')
        .update({ profile_image: imageSrc })
        .eq('student_id', currentStudentId)
        .then(({ error }) => {
          if (error) {
            alert("Failed to save profile picture: " + error.message);
          } else {
            alert("Profile picture updated successfully!");
          }
        });
    },
    function(message) {
      alert("CAMERA ERROR: " + message);
    },
    cameraOptions
  );
}

// ==========================================
// 6. DELETE (Delete account from Supabase)
// ==========================================
async function deleteAccount() {
  const currentStudentId = localStorage.getItem("loggedInStudentId");
  if (!currentStudentId) return;

  const confirmDelete = confirm("Are you sure you want to delete your account?");
  if (!confirmDelete) return;

  const { error } = await supabaseClient
    .from('students')
    .delete()
    .eq('student_id', currentStudentId);

  if (error) {
    alert("Unable to delete account: " + error.message);
  } else {
    alert("Account deleted successfully.");
    logoutUser();
  }
}

// ==========================================
// 7. MODAL LOGIC
// ==========================================
async function openModal() {
  const currentStudentId = localStorage.getItem("loggedInStudentId");
  const { data } = await supabaseClient
    .from('students')
    .select('*')
    .eq('student_id', currentStudentId)
    .single();

  if (data) {
    if (nameInput) nameInput.value = data.full_name || "";
    if (courseInput) courseInput.value = data.course || "";
    if (yearInput) yearInput.value = data.year_level || "";
    if (aboutInput) aboutInput.value = data.about_me || "";
    if (skillsInput) skillsInput.value = data.skills || "";
  }

  if (errorMsg) errorMsg.classList.add('hidden');
  if (editModal) editModal.classList.remove('hidden');
}

function closeModal() {
  if (editModal) editModal.classList.add('hidden');
}

// ==========================================
// 8. LOGOUT & AUTHENTICATION
// ==========================================
function logoutUser() {
  localStorage.removeItem("loggedInStudentId");
  if (loginScreen) loginScreen.style.display = "block";
  if (profileScreen) profileScreen.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "none";
}

async function bindEventListeners() {
  initDOMElements();

  // Restore logged-in session state
  const loggedInStudentId = localStorage.getItem("loggedInStudentId");
  if (loggedInStudentId) {
    if (loginScreen) loginScreen.style.display = "none";
    if (profileScreen) profileScreen.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    await loadProfile();
  }

  // Camera Trigger Bindings
  if (changePhotoBtn) {
    changePhotoBtn.onclick = openCamera;
  }
  if (avatarContainer) {
    avatarContainer.onclick = openCamera;
  }

  // Login Handler
if (loginBtn) {
  loginBtn.onclick = async function (event) {
      event.preventDefault();

      const studentId = document.getElementById("login-id").value.trim();
      const password = document.getElementById("login-password").value;

      if (!studentId || !password) {
        if (loginError) loginError.textContent = "Please enter both Student ID and Password.";
        return;
      }

const hashedPassword = await hashPassword(password);

      const { data, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .eq('password', hashedpassword)
        .single();

      if (error || !data) {
        if (loginError) loginError.textContent = "Invalid Student ID or password.";
      } else {
        if (loginError) loginError.textContent = "";
        localStorage.setItem("loggedInStudentId", data.student_id);

        if (loginScreen) loginScreen.style.display = "none";
        if (profileScreen) profileScreen.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        await loadProfile();
      }
    };
  }

  // Register Handler
  if (registerBtn) {
    registerBtn.onclick = async function () {
      const studentId = document.getElementById("login-id").value.trim();
      const password = document.getElementById("login-password").value;

      if (!studentId || !password) {
        alert("Please enter a Student ID and Password to register.");
        return;
      }

      const { error } = await supabaseClient
        .from('students')
        .insert([
          {
            student_id: studentId,
            password: password,
            full_name: "Abegail P. Cailing",
            course: "BSIT",
            year_level: "3rd Year",
            about_me: "Hello! I am a BSIT student.",
            skills: "HTML, CSS, JavaScript"
          }
        ]);

      if (error) {
        alert("Registration failed: " + error.message);
      } else {
        alert("Registration successful! You can now log in.");
      }
    };
  }

  // Standard Button Events
  if (logoutBtn) logoutBtn.onclick = logoutUser;
  if (editBtn) editBtn.onclick = openModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  if (editForm) editForm.onsubmit = saveProfile;
  if (deleteAccountBtn) deleteAccountBtn.onclick = deleteAccount;

  if (editModal) {
    editModal.onclick = function (e) {
      if (e.target === editModal) closeModal();
    };
  }
}

bindEventListeners();