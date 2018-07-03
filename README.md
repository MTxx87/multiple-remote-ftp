# Remote Ftp Multiple Hosts Add-On
Plugin for Atom editor that adds possibility for multiple .ftpconfig files within a single project using Remote Ftp.
It is useful when working with multiple server environments.

Dependencies:
* Remote-Ftp https://github.com/icetee/remote-ftp
* Project Manager https://atom.io/packages/project-manager

Getting Started
* create a /ftpconfigs folder under the project root
* in the folder create as many .ftpconfig file as needed. Follow the naming "{name}.ftpconfig" (Eg. DEVELOPEMENT.ftpconfig, STAGING.ftpconfig, PRODUCTION.ftpconfig,)
* menu Packages > Multiple Remote Ftp > toggle
* be sure to have Tree View open
* select an ftp file from the dropdown
* Remote FTP should connect to the selected server

![image](https://github.com/matteotonini/multiple-remote-ftp/blob/master/screenshot1.png)

NOTES:
* When an option is selected from the dropdown the plugin just copies the related {name}.ftpconfig in the root folder of your project and then it renames it as .ftpconfig before triggering the command 'remote-ftp:connect'. It is not particularly elegant solution, but I had/have no time to refine or going with a more elegant approach. I have to say that it worked without problems since day one and I use Atom on daily basis.
* At the moment it only support .ftpconfig. If somebody needs .sftpconfig files, it is not huge development to add the functionality. Open an issue or directly submit a pull request.
