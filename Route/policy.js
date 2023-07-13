import express from "express";
import { getClient } from "../StartUp/DB.js";
const route = express.Router();

route.get('/get_policy_userId', async(request, response)=>{
    const client = getClient();
    const policyCollection = client.db('userManagement').collection('policies');
    const user_id =  request.query.id;
    try{  
        const policeInfo = await policyCollection.find({user_id}).toArray();
        response.status(200).send(policeInfo);
        } catch(error){

            response.status(500).send(error);
    
        }

});
route.get('/aggregated', async (req, res) => {
    try {
      const client = getClient();
      const policyCollection = client.db('userManagement').collection('policies');
  
      // Perform the aggregation query
      const aggregationResult = await policyCollection.aggregate([
        {
          $group: {
            _id: '$user_id',
            policies: {
              $push: {
                policy_number: '$policy_number',
                policy_start_date: '$policy_start_date',
                policy_end_date: '$policy_end_date',
              },
            },
          },
        },
      ]).toArray();
  
      // Return the aggregation result as the API response
      res.status(200).send(aggregationResult);
    } catch (error) {
      console.error('Aggregation error:', error);
      res.status(500).send({ message: 'Aggregation failed' });
    }
  });
  

export default route;
