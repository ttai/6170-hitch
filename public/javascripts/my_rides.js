$(document).ready(function() {
  $('#my_upcoming_rides').DataTable();
});
$(document).ready(function() {
  $('#my_past_rides').DataTable();
});
$(document).ready(function($) {
  $(".clickable-row").click(function() {
    window.document.location = $(this).data("href");
  });
});
