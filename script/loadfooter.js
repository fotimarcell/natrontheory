document.addEventListener('DOMContentLoaded', function() {
    var footerHtml = `
    <div class="footfelirat">
        <div style="margin-left: 10px; font-style: italic;">...and the rest is history. Rewritten.</div>
        <a style="margin-right: 10px;" href="https://twitter.com/fomahun" target="_blank">@fomahun</a>
    </div>
    `;
  
    var bookHtml = `
    <div style="position:fixed;right:10px;bottom:10px;width:140px;height:222px; border: 2px solid red; z-index: 2000;">
        <a href="https://www.amazon.com/dp/B0DG3JT2N5" target="_blank">
            <div style="color:red;background-color: #fffa;">The Book is out!</div>
            <div style="background-image: url('img/book.jpg');background-size:cover;width:140px;height:200px;">
            </div>
        </a>
    </div>
    `;
  
    document.getElementById('book-placeholder').innerHTML = bookHtml;
    document.getElementById('footer-placeholder').innerHTML = footerHtml;
  });
  