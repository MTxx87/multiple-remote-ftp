'use babel';

const fs = require('fs');

export default class MultipleRemoteFtpView {

  constructor(serializedState, configFiles) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('multiple-remote-ftp');

    var template =
      '<div class="mrftp-container">' +
        '<div class="mrftp-title">Multiple Remote Ftp</div>' +
        '<div class="mrftp-selected">' +
         '<div class="mrftp-selected-label"> -- None Selected -- </div>' +
         '<div class="mrftp-available">' +
           '<ul>' +
               '<li data-config=""> -- None -- </li>';

                if (configFiles.length) {
                   for (i=0; i < configFiles.length; i++) {
                     name = configFiles[i].replace('.ftpconfig', '').replace(' ', '');
                     template += '<li data-config="' + name + '">' + name + '</li>';
                   }
                }

     template += '</ul>' +
         '</div>' +
        '</div>' +
      '</div>';

    let inner = this.htmlToElement(template);
    this.element.appendChild(inner);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
 }

 updateLabel(text) {
   let element = this.element;
   let selected = element.querySelector('.mrftp-selected-label');
   selected.innerHTML = text;
   return true;
 }

}
