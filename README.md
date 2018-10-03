# Remote Ftp Multiple Hosts Add-On
Plugin for Atom editor that adds possibility for multiple .ftpconfig and .ftpignore files within a single project using Remote Ftp. It is useful when working with multiple server environments.

Version 0.3.0 VS 0.3.1:
Starting from version 0.3.1, I've added support for .ftpignore files.
For this reason, I decided to change strategy regarding the structure of the /ftpconfigs folder.
The structure that worked until 0.3.0 will no longer work after you'll upgrade to 0.3.1.
Migrating to the new structure is very easy though, just follow the getting started guide below.


Dependencies:
* Remote-Ftp https://github.com/icetee/remote-ftp
* Project Manager https://atom.io/packages/project-manager

Getting Started
* create a /ftpconfigs folder under the project root
* under /ftpconfigs create as many .ftpconfig and .ftpignore files as needed, following the structure:<br/>  "ftpconfigs/{environment-name}/.ftpconfig"<br/>
"ftpconfigs/{environment-name}/.ftpignore"<br/>
Eg.         
  * /ftpconfigs
    * /development
      * .ftpconfig
      * .ftpignore
    * /production
      * .ftpconfig
* menu Packages > Multiple Remote Ftp > toggle
* be sure to have Tree View open
* select an ftp file from the dropdown
* Remote FTP should connect to the selected server

![image](https://github.com/MTxx87/multiple-remote-ftp/blob/ftpignore-support-test/screenshot2.png)

NOTES:
* When an option is selected from the dropdown the plugin just copies the related {environment-name}/.ftpconfig and /.ftpignore in the root folder of your project  before triggering the command 'remote-ftp:connect'. It is not a particularly elegant solution, but I had/have no time to refine or going with a more elegant approach. I have to say that it worked without problems since day one and I use Atom on daily basis.
