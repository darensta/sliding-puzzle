/* share.js
   Canonical social sharing layer
*/

export function shareOnFacebook(moves) {
  const url = encodeURIComponent(window.location.href);

  const quote = encodeURIComponent(
    `I just solved the Edmunds.com sliding puzzle in ${moves} moves!`
  );

  const fbUrl =
    `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;

  window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=500");
}
