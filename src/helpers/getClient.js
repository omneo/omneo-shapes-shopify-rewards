import ShapesSDK from '@omneo/shapes-sdk';
import storage from 'local-storage-fallback'; 
import jwtDecode from 'jwt-decode';

const validateToken = token => {
    try{
        const {pid, exp} = jwtDecode(token);
        const now = Math.round(Date.now() / 1000);
        return pid && exp > now
    }catch(e){
        return false
    }
}

const getToken = (config) => {
    const {token, customerSignature, customerId, pluginUrl} = config;
    return new Promise(resolve=>{
        const cachedToken = storage.getItem('shapes:omneo:shapestoken:'+customerId);
        if(cachedToken){
            if(validateToken(cachedToken)){
                return resolve(cachedToken);
            }
        }

        if(token && validateToken(token)){
            return resolve(token);
        }

		if(!customerId || !customerSignature || !pluginUrl){
            return resolve(false);
        }

        // Get new token from plugin
        fetch(`${pluginUrl}/api/v1/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: customerId, 
                signature: customerSignature
            })
        }).then(response=>{
            try{
                response.json().then(json=>{
                    if(json.data.token){
                        return resolve(json.data.token);
                    }
                    throw(false)
                })
            }catch(e){
                throw(false)
            }
        }).catch(e=>{
            return resolve(false)
        })
    })
}

const getClient = (config) => {
    const {idUrl, customerId} = config; 
    return new Promise(resolve => {
        try{
            if(window.ShapesSDKClient.ready){
                return resolve(window.ShapesSDKClient)
            }
        }catch(e){}

        getToken(config).then(validToken=>{
            if(!validToken){
                console.error('No valid shapes token'); 
                storage.removeItem('shapes:omneo:shapestoken:'+customerId);
                return resolve(false)
            }else{
                storage.setItem('shapes:omneo:shapestoken:'+customerId, validToken);
            }

            try{
                const client = ShapesSDK.init({
                    url: idUrl, 
                    token: validToken,
                    isPrivate: true,
                    logging: false
                });
                if(client.ready){
                    return resolve(client);
                }
                throw(false);
            }catch(e){
                return resolve(false)
            }
        });
    })
}

export default getClient