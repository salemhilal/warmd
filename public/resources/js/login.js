/* globals $, _ */

$(document).ready(function() {
  'use strict';

  var $alert = $('#login-err');

  // This is an unsuccessful login attempt, let the user know.
  if(window.location.href.indexOf('success=false') !== -1) {
    $alert.slideDown();
  }

  // Hmm, they were going somewhere?
  if(window.location.href.indexOf('#/') !== -1) {
    var goto = window.location.href.slice(window.location.href.indexOf('#/')+2);
    if (goto) {
      localStorage.setItem('warmd_goto_url', goto);
    }
  }
  // They aren't trying to log in, and the aren't trying to go somewhere,
  // so make sure localStorage is empty
  else if(window.location.href.indexOf('success=false') === -1) {
    localStorage.removeItem('warmd_goto_url');
  }

  // Validate email
  // http://stackoverflow.com/questions/2507030/email-validation-using-jquery
  function isEmail(email) {
    var emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return emailRegex.test(email);
  }

  // Hide / show error messages for input, and color the input boxes
  function toggleError($elem, error, message) {
    var $formGroup = $elem.closest('.form-group'),
        $errorMessage = $formGroup.find('.error-message');

    if($elem.val().trim() === '') {
      $elem.removeClass('has-success has-error');
      $errorMessage.slideUp();
    } else if (error) {
      $errorMessage.text(message).slideDown();
      $formGroup.removeClass('has-success').addClass('has-error');
    } else {
      $errorMessage.slideUp();
      $formGroup.removeClass('has-error').addClass('has-success');
    }
    $elem.trigger('recheck');
  }

  // Login / Signup form toggle
  $('.show-signup').click(function() {
    $('.login-form').slideUp();
    $('.signup-form').slideDown();
  });
  $('.show-login').click(function() {
    $('.login-form').slideDown();
    $('.signup-form').slideUp();
  });

  var checkFirstName = _.debounce(function($elem, name) {
    toggleError($elem, !name.length, 'Please provide your first name');
  }, 500);

  var checkLastName = _.debounce(function($elem, name) {
    toggleError($elem, !name.length, 'Please provide your last name');
  }, 500);

  // Checks to see if the username is valid, and isn't taken
  var checkUsername = _.debounce(function($elem, username) {
    
    if(!username.length) { 
      toggleError($elem, !username.length, 'Please enter a username');
      return;
    } else {
      $.post('/users/exists', {username: username}, function(data) {
        $elem.closest('.form-group')
          .toggleClass('has-error', data.exists)
          .toggleClass('has-success', !data.exists);
        toggleError($elem, data.exists, 'That username is already in use');
      });
    }
  }, 500);

  // Checks to see if the email is valid and untaken
  var checkEmail = _.debounce(function($elem, email) {
    toggleError($elem, !isEmail(email), 'Please enter a valid email address');
    if(!isEmail(email)) { return; }
    $.post('/users/exists', {email: email}, function(data) {
      $elem.closest('.form-group')
        .toggleClass('has-error', data.exists)
        .toggleClass('has-success', !data.exists);
      toggleError($elem, data.exists, 'That email is already in use');
    });
  }, 500);

  // Checks password
  var checkPassword = _.debounce(function($elem, password) {
    toggleError($elem, password.length < 8, 'Your password must be at least 8 characters');
  }, 500);

  // First and last name
  $('.signup-form .fname, .signup-form .lname').on('input', function() {
    var placeholder = 'Enter a username',
        fname = $('.signup-form .fname').val(),
        lname = $('.signup-form .lname').val();

    if (fname.length && lname.length) {
      placeholder += ' (like ' + (fname[0] + lname).toLowerCase() + ')';
      $('.part2').slideDown();
    } 
    $('.signup-form .username').attr('placeholder', placeholder);
  }).on('blur input', function() {
    var $this = $(this);
    if($this.hasClass('fname')) {
      checkFirstName($this, $this.val().trim());  
    } else {
      checkLastName($this, $this.val().trim());
    }
  });

  // Username Field
  $('.signup-form .username').on('blur input', function(event) {
    var $this = $(this);
    checkUsername($this, $this.val().trim());
  });

  // Email Field
  $('.signup-form .email').on('blur input', function(event) {
    var $this = $(this);
    checkEmail($this, $this.val().trim()); 
  });

  // Password
  $('.signup-form .password').on('blur input', function() {
    var $this = $(this);
    checkPassword($this, $this.val());
  });

  // Signup button
  $('.signup-form').on('input blur recheck', function() {
    var $this = $(this),
        enable = $this.find('.form-group.has-success').length === 5;

    console.log('enable', enable);
    $this.find('.submit-signup')
      .prop('disabled', !enable)
      .toggleClass('btn-primary', enable);

  }).find('.submit-signup').on('click', function(event) {
    event.preventDefault();
    console.log(event);
  });
});