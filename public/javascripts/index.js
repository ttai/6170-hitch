$(document).ready(function() {
  $('#open_rides').DataTable( {
  });
});

$(document).ready(function($){
  $("#open_rides").on("click", ".clickable-row", function(){
    window.document.location = $(this).data("href");
  });
})

