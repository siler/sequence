import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

export const Shell = () => {
   return (
      <div>
         <Outlet />
         <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
         />
      </div>
   );
};
