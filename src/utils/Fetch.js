export class Fetch{

  static async get(url, params = {}){

    return await Fetch.request('GET', url, params);
  }

  static async delete(url, params = {}){

    return await Fetch.request('DELETE', url, params);
  }
  
  static async put(url, params = {}){

    return await Fetch.request('PUT', url, params);
  }
  
  static async post(url, params = {}){

    return await Fetch.request('POST', url, params);
  }    

  static async request(method, url, params = {}){

    try{

      let request;

      switch(method.toLowerCase()){

        case 'get':
          request = url;
          break;

        default:
          request = new Request(url, {
              method,
              body: JSON.stringify(params),
              headers: new Headers({
                  'Content-Type':'application/json'
              })
          });
      }

      const response = await fetch(request);
      const json = await response.json();

      return json;

    }catch(error){
      console.log(error);
    }      
  }
}