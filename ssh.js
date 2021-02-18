const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH();

ssh.connect({
    host: 'crm.oneclic.dev',
    username: 'root',
    password: '4ghS22yy0L'
}).then(session => {
    console.log(ssh.isConnected());
    const cwd = '/var/www/crm.oneclic.dev/';
    ssh.execCommand('cd client', {cwd}).then(console.log);
});