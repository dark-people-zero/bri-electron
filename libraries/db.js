const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const config = require('../config.json');

class DB {
	constructor() {
		
	}
	
	async saveData(prm, type) {
		try {
			var mongoUrl = config.url_mongo+"/insert";
			var doUrl = config.url_do+"/"+type;

			var opt = {
				method : 'POST',
				body : JSON.stringify(prm.data),
				headers : {
					'Content-Type' : 'application/json',
					'X-Augipt-Gtwmutasi' : config.key_header_mongo
				}
			}
			let req = await fetch(mongoUrl, opt);
			let res = await req.json();
			if (res.status) {
				var dataDo = {
					"bank": config.bankCode,
					"no_rek": prm.norek,
					"username": prm.username,
					"mongo_id": res.id,
					"created_by": prm.email,
					"date": prm.time
				}
				opt.body = JSON.stringify(dataDo);
				opt.headers['X-Augipt-Gtwmutasi'] = config.key_header_do;
				req = await fetch(doUrl, opt);
				res = await req.json();
				if (res.status) return res;
				else return {
					status: false,
					message: res.message.join(",")
				}
			}else{
				return {
					status: false,
					message: res.errors.join(",")
				}
			}
		} catch (err) {
			console.log(err.message);
			return {
				status: false,
				message: err.message
			}
		}
	}

	async mutasi(prm) {
		try {
			var mongoUrl = config.url_mongo+"/insert";
			var doUrl = config.url_do+"/mutasi";

			var opt = {
				method : 'POST',
				body : JSON.stringify(prm.data),
				headers : {
					'Content-Type' : 'application/json',
					'X-Augipt-Gtwmutasi' : config.key_header_mongo
				}
			}
			let req = await fetch(mongoUrl, opt);
			let res = await req.json();
			if (res.status) {
				var dataDo = {
					"bank": config.bankCode,
					"no_rek": prm.norek,
					"username": prm.username,
					"mongo_id": res.id,
					"created_by": prm.email,
					"date": prm.time
				}
				opt.body = JSON.stringify(dataDo);
				opt.headers['X-Augipt-Gtwmutasi'] = config.key_header_do;
				req = await fetch(doUrl, opt);
				res = await req.json();
				if (res.status) return res;
				else return {
					status: false,
					message: res.message.join(",")
				}
			}else{
				return {
					status: false,
					message: res.errors.join(",")
				}
			}
		} catch (err) {
			console.log(err.message);
			return {
				status: false,
				message: err.message
			}
		}
	}
}

module.exports = new DB();


