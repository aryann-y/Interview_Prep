// import React from 'react'

// const DeleteAlertContent = ({content,OnDelete}) => {
//   return (
//     <div className='p-5'>
//         <p className='text-[14px]'>{content}</p>
//         <div className='flex justify-end mt-6'>
//             <button
//             type="button"
//             className='btn-small'
//             onClick={OnDelete}>
//                 Delete
//             </button>
//         </div>
//     </div>
//   )
// }

// export default DeleteAlertContent


import React from 'react';

const DeleteAlertContent = ({ content, onDelete }) => {
  const handleDeleteClick = () => {
    console.log("Delete button clicked in DeleteAlertContent, calling onDelete");
    if (typeof onDelete === 'function') {
      onDelete();
    } else {
      console.error("onDelete is not a function:", onDelete);
    }
  };

  return (
    <div className="p-5">
      <p className="text-[14px]">{content}</p>
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="btn-small"
          onClick={handleDeleteClick} // Use the handler to log and call onDelete
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlertContent;