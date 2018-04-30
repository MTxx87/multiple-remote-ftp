'use babel';

const fs = require('fs');

export default class MultipleRemoteFtpView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('multiple-remote-ftp');

    // Create message element
    //const message = document.createElement('div');
    // message.textContent = 'The MultipleRemoteFtp package is Alive! It\'s ALIVE!';
    // message.classList.add('message');
    // console.log(fs);
    // console.log(atom.project.getPaths()[0]);
    //console.log(atom.workspace.scan());

    this.template =
      '<div class="mrftp-container">' +
        '<div class="mrftp-title">Multiple Remote Ftp</div>' +
        '<div class="mrftp-selected">' +
         '<div class="mrftp-selected-label"> -- None Selected -- </div>' +
         '<div class="mrftp-available">' +
           '<ul>' +
               '<li data-config=""> -- None -- </li>' +
               '{PLACEHOLDER}' +
           '</ul>' +
         '</div>' +
        '</div>' +
      '</div>';

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

 feedInSelect(files) {

   if (!files.length) {
     return false;
   }

   var html = '';
   for (i=0; i<files.length; i++) {
     name = files[i].replace('.ftpconfig', '').replace(' ', '');
     html += '<li data-config="' + name + '">' + name + '</li>';
   }

   let feeded = this.template.replace('{PLACEHOLDER}', html);
   var div = this.htmlToElement(feeded);
   this.element.appendChild(div);
   return true;
 }

 updateLabel(text) {
   let element = this.element;
   let selected = element.querySelector('.mrftp-selected-label');
   selected.innerHTML = text;
   return true;
 }

}
