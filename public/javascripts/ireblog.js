var THRESHOLD = 10;
var INTERVAL  = 300;
var SUMMER    = 250;
var RANDOM    = false;

var page      = 1;
var minimum   = 10000000000000000;
var lock      = false;

var postArray = [];

$(document).ready(function() {
  if(location.href.match(/#random/)) RANDOM = true;

  $(window).keydown(function(e) {
    var keyCode = e.keyCode;
    if(keyCode == 74) pass();   // j
    //if(keyCode == 79) _open();  // o
    if(keyCode == 85) reblog(); // u
  });
  load();

  $('#posts').empty().append($('<div />').addClass('films')
                     .append($('<div />').attr('id', 'reblog').addClass('film').height(500).css({ 'left': 0 }).click(reblog))
                     .append($('<div />').attr('id', 'pass').addClass('film').height(500).css({ 'right': 0 }).click(pass))
                    );
});

function pass() {
  var firstPost = postArray.shift();
  $('.pass', firstPost).fadeTo('fast', 0.2);
  next(firstPost, postArray[0]);
}

function reblog() {
  var firstPost = postArray.shift();
  var reblogImg = $('.reblog', firstPost);
  reblogImg.fadeTo('fast', 0.2);

  var firstPostId = firstPost.attr('id');
  var postId    = firstPostId.match(/^post_(\d+)_.+$/)[1];
  var reblogKey = firstPostId.match(/^post_\d+_([0-9a-zA-Z]+)$/)[1];

  $.post('/reblog', { post_id: postId, reblog_key: reblogKey });
  next(firstPost, postArray[0]);
}

function next(firstPost,secondPost) {
  setTimeout(function() {
    firstPost.remove();
    if(secondPost) secondPost.removeClass('standby');
    load();
    document.body.scrollTop = 0;
  }, INTERVAL);
}

function appendPost(li, d) {
  var posts = $('#posts');

  switch(d['type']) {
  case 'regular':
    posts.append(
      li.append($('<div />').addClass('post').addClass('chat_post')
                .html('<div class="title">' +  d['regular_title'] + '</div>' + d['regular_body'])
               )
    );
    break;
  case 'photo':
    posts.append(
      li.append($('<div />').addClass('post').addClass('photo_post')
                .append($('<a />').attr('href', d['url'])
                        .append($('<img />').attr('src', d['photo_url'][3]).width(400).addClass('photo'))
                       )
                .append($('<div />').addClass('caption').html(d['photo_caption']))
               )
    );
    break;
  case 'quote':
    posts.append(
      li.append($('<div />').addClass('post').addClass('quote_post')
                .append($('<div />').addClass('quote')
                        .append($('<span />').addClass('quote').html(d['quote_text']))
                       )
                .append($('<div />').addClass('source').html(d['quote_source']))
               )
    );
    break;
  case 'link':
    posts.append(
      li.append($('<div />').addClass('post').addClass('link_post')
                .append($('<div />').addClass('link').html(d['link_text']))
               )
    );
    break;
  case 'conversation':
    posts.append(
      li.append($('<div />').addClass('post').addClass('chat_post')
                .append($('<div />').addClass('title').html(d['conversation_title']))
                .append($('<div />').addClass('chat').html(d['conversation_text']))
               )
    );
    break;
  }
}

function load() {
  if(postArray.length < THRESHOLD && !lock) {
    lock = true;
    var num = RANDOM ? -1 : page;
    $.getJSON('/dashboard', { page: num }, function(data) {
      lock = false;
      page++;
      $('#loading').remove();

      for(var i = 0, len = data.length; i < len; ++i) {
        var d = data[i];
        var postId = parseInt(d['id']);

        if(!RANDOM && minimum <= postId) {
          if(i == (len - 1)) load();
          break;
        }
        minimum = postId;

        var li = $('<li />').attr('id', 'post_' + postId + '_' + d['reblog_key']).addClass('post').addClass('standby');
        postArray.push(li);

        li.append($('<div />').addClass('post_info')
                  .append($('<a />').addClass('author').attr('href', d['url']).text(d['tumblelog']))
                  .append($('<a />').addClass('permalink').attr('href', d['url']).text('(permalink)'))
                  .append($('<img />').addClass('reblog').attr({ 'src': './images/reblog.gif', 'id': 'reblog_' + postId }))
                  .append($('<img />').addClass('pass').attr('src', './images/pass.gif'))
                 );

        appendPost(li, d);
      }

      if(postArray[0]) postArray[0].removeClass('standby');
    });
  }
}
