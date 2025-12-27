/* share.js
   Canonical social sharing layer
*/

export function shareOnFacebook(moveCount) {
  const url = window.location.href;
  const quote = `I just solved the Edmunds.com tile puzzle in ${moveCount} moves`;
  const shareUrl =
    "https://www.facebook.com/sharer/sharer.php" +
    `?u=${encodeURIComponent(url)}` +
    `&quote=${encodeURIComponent(quote)}`;
  window.open(shareUrl, "_blank");
}
