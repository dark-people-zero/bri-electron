const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require('../config.json');
class BK {
    constructor() {

    }

    async situs() {
        try {
            var url = config.bk_url1+"/account/account/sites"
			const response = await fetch(url, {
				method: 'GET',
                redirect: 'follow'
			});
            
			return await response.json();
		} catch (err) {
			console.log(err.message);
			return {
				status: false,
				message: err.message
			}
		}
    }

	async login(data) {
		try {
			var url = `${config.bk_url}${data.situs}/dashboard/account/api-login/${data.type}`;
			
			var urlencoded = new URLSearchParams();
			urlencoded.append("user_email", data.username);
			urlencoded.append("user_password", data.password);

			const response = await fetch(url, {
				method: 'POST',
                redirect: 'follow',
				body: urlencoded,
			});
            
			return await response.json();
		} catch (err) {
			console.log(err.message);
			return {
				status: false,
				message: err.message
			}
		}
	}

	async account(token) {
		try {
			var url = `${config.bk_url1}account/account/account`;
			const response = await fetch(url, {
				method: 'GET',
                redirect: 'follow',
				headers: {
					authorization: token
				}
			});
            
			return await response.json();
		} catch (err) {
			console.log(err.message);
			return {
				status: false,
				message: err.message
			}
		}
	}

	async rekening(user) {
		try {
			var url = `${config.bk_url}${user.situs}/mutasi/api/rekening/listaccount/${config.bankCode}`;
			const response = await fetch(url, {
				method: 'GET',
                redirect: 'follow',
				headers: {
					authorization: user.token
				}
			});
            
			return await response.json();
		} catch (err) {
			console.log(err.message);
			return {
				status: false,
				message: err.message
			}
		}
	}
}

module.exports = new BK();