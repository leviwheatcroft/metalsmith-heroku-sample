/* globals Cookies */

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function ($) {
  var MQL = 1170

  // primary navigation slide-in effect
  if ($(window).width() > MQL) {
    var headerHeight = $('.navbar-custom').height()
    $(window).on('scroll', {
      previousTop: 0
    },
    function () {
      var currentTop = $(window).scrollTop()
      // check if user is scrolling up
      if (currentTop < this.previousTop) {
        // if scrolling up...
        if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
          $('.navbar-custom').addClass('is-visible')
        } else {
          $('.navbar-custom').removeClass('is-visible is-fixed')
        }
      } else if (currentTop > this.previousTop) {
        // if scrolling down...
        $('.navbar-custom').removeClass('is-visible')
        if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed')
      }
      this.previousTop = currentTop
    })
  }
})

// show disclaimer unless cookie is set
jQuery(document).ready(function ($) {
  if (window.location.pathname.indexOf('articles') === -1) return
  if (!Cookies.get('disclaimer')) {
    $('#disclaimer').show()
  }
  $('#disclaimer').on('click', function (el) {
    Cookies.set('disclaimer', true)
  })
})

// show old content warning if modified date > 2 years
jQuery(document).ready(function ($) {
  if (window.location.pathname.indexOf('articles') === -1) return
  var published
  published = $('meta[name="DCTERMS.modified"]').attr('content')
  published = new Date(published)
  published = new Date().getTime() - published.getTime()
  published = published / (24 * 60 * 60 * 1000)
  console.log(published)
  if (published > 730) $('#old-content').show()
})
