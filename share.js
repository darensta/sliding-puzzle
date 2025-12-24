/* share.js
   Social sharing utilities (debug-safe, production-ready)
*/
function shareOnFacebook(moves) {
  const text = encodeURIComponent(
    `I just solved the Edmunds.com tile puzzle in ${moves} moves!`
  );

  const url = encodeURIComponent(window.location.href.split("?")[0]);

  const shareUrl =
    `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;

  window.open(shareUrl, "_blank", "width=600,height=400");
}

window.shareOnFacebook = shareOnFacebook;
