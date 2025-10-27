import React from "react";
import axios from "axios";
import { useEffect } from "react";
const NoticeBoard = () => {
  var notices = undefined
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:5174/notices'
        });
        if(response.status == 200)
        {
          console.log(response.data)
          notices = response.data.data
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <>
    <div className=" bg-image bg-cover bg-bottom w-[95%] h-[80%] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden m-20">
        
    </div>
    </>
  );
};

export default NoticeBoard;