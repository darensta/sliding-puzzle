async function loadFragment(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).insertAdjacentHTML("afterbegin", html);
}

loadFragment("site-header", "header.html");
loadFragment("site-footer", "footer.html");
