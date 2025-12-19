/* share.js
   Social sharing utilities (debug-safe, production-ready)
*/

function shareOnFacebook({ url, quote }) {
  if (!url) {
    console.warn("[Share] Missing URL for Facebook share.");
    return;
  }

  const shareUrl =
    "https://www.facebook.com/sharer/sharer.php?" +
    new URLSearchParams({
      u: url,
      quote: quote || ""
    }).toString();

  // Open in a new window/tab
  window.open(
    shareUrl,
    "_blank",
    "noopener,noreferrer,width=600,height=500"
  );
}
