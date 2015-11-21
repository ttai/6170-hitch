// Wrapped in an immediately invoked function expression.
(function() {
  $(document).on('click', '#submit-new-ride', function(evt) {
      evt.preventDefault();
      var formData = helpers.getFormData(this);
      if (!formData.pickupLocation && !formData.destination && !formData.departureTime){
        $('.error').text('Pickup location, destination location, and departure time cannot all be blank.');
        return;
      }
      delete formData['confirm'];
      $.post(
          '/rides',
          formData
      ).done(function(response) {
          loadHomePage();
      }).fail(function(responseObject) {
        console.log(responseObject);
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
    });
})();
