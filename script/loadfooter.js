document.addEventListener('DOMContentLoaded', function() {
    var footerHtml = `
    <div class="footfelirat">
        <div style="margin-left: 10px; font-style: italic;">...and the rest is history. Rewritten.</div>
        <a style="margin-right: 10px;" href="https://twitter.com/fomahun" target="_blank">@fomahun</a>
    </div>
    `;
  
    var bookHtml = `
    <div class="book">
        <a href="https://www.amazon.com/dp/B0DG3JT2N5" target="_blank" class="aaa">
            <div class="bookisout">The Book is out!</div>
            <div class="bookimage" style="background-image: url('img/book.jpg');">
            </div>
        </a>
    </div>
    `;
  
    document.getElementById('book-placeholder').innerHTML = bookHtml;
    document.getElementById('footer-placeholder').innerHTML = footerHtml;
  });
  