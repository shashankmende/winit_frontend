import React, { useEffect, useState } from "react";
import "./home.css";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import { IoCloseSharp } from "react-icons/io5";
// import ApprovedComponent from "../ApprovedComponent";

const customersList = [
  {
    customerId: 1,
    address: "3rd Ring road, Opposite quesidy ,Block1, Dubai",

    salesOrderNumber: "KL0021000018",
    customerName: "[KL00000124] ABHILASH store",
  },
  {
    customerId: 2,
    address: "3rd Ring road, Opposite quesidy ,Block1, Dubai",
    salesOrderNumber: "KL0021000018",
    customerName: "[KL00000124] Akshith super mart",
  },
  {
    customerId: 3,
    address: "3rd Ring road, Opposite quesidy ,Block1, Dubai",
    salesOrderNumber: "KL0021000018",
    customerName: "[KL00000124] Karthik super market",
  },
  {
    customerId: 4,
    address: "3rd Ring road, Opposite quesidy ,Block1, Dubai",
    salesOrderNumber: "KL0021000018",
    customerName: "[KL00000124] Vishnu market",
  },
];

const tabsList = [
  { id: 0, tabName: "Pending" },
  { id: 1, tabName: "Approved" },
  { id: 2, tabName: "Rejected" },
];

const Home = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(
    "Select Customer Name"
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedTab, setSelectedTab] = useState(tabsList[0].tabName);
  const [pendingTabData, setPendingTabData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);
  const [selectedAdress, setselectedAdress] = useState("");
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  const handleAddClick = () => {
    if (selectedCustomer && selectedCustomerId) {
      navigate("/addProduct", {
        state: {
          selectedCustomer,
          customerId: selectedCustomerId,
          address: selectedAdress,
        },
      });
    } else {
      alert("Please select a customer");
    }
  };

  const handleCustomerSelect = (customerId, customerName, address) => {
    setSelectedCustomer(customerName);
    setSelectedCustomerId(customerId);
    setselectedAdress(address);
  };

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const url = "https://winit-backend.onrender.com/winit_services/table_data";
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const responseObject = response.data.customerSummary;

          const customersMap = customersList.reduce((map, customer) => {
            map[customer.customerId] = customer;
            return map;
          }, {});

          const returnObject = (resObj, custMap) => {
            return resObj
              .map(({ customerId, orderDate, totalAmount }) => {
                const customer = custMap[customerId];
                if (customer) {
                  return {
                    salesOrderNumber: customer.salesOrderNumber,
                    customerName: customer.customerName,
                    customerId: customer.customerId,
                    orderDate: orderDate,
                    totalAmount: totalAmount,
                    isChecked: false
                    
                  };
                }
                return null;
              })
              .filter((item) => item !== null);
          };

          const transformedData = returnObject(responseObject, customersMap);

          const requiredObject = {
            ...responseObject,
            transformedData, // Add transformed data as a new field in the object
          };
          console.log("required object", requiredObject);
          setTableData(requiredObject);
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchTableData();
  }, []);

  const OnClickDeleteInHome = async(cId,iCd) => {
    try {
      
      const url = `https://winit-backend.onrender.com/winit_services/rejected_tab/${cId}`


      // const deleteUrlResponse = await axios.delete()




      const response = await axios.delete(url,{
        headers:{
          "Content-Type":"application/json"
        }
      })

      if (response.status===200){
        console.log("Item delted successfully")
      }

      const filteredList = pendingTabData.filter(
        (each) => each.customerId !== cId
      );
      setPendingTabData(filteredList);
  
      // Additionally, remove the item from tableData.transformedData if needed
      setTableData((prevData) => ({
        ...prevData,
        transformedData: prevData.transformedData.filter(
          (each) => each.customerId !== cId
        ),
      }));




      
    } catch (error) {
        console.log("Error in main page on click delete button of specific store",error)
    }

  };

  const onClickEditInHome = (customerId) => {
    // Find the customer based on the customerId
    const customer = customersList.find(cust => cust.customerId === customerId);
  
    // Extract the address from the customer object
    const address = customer ? customer.address : '';
  
    // Navigate to the new route with the customer information
    navigate("/storedProduct", {
      state: {
        selectedCustomer: customer.customerName,
        customerId,
        address,
      },
    });
  };

  const onClickCheckBoxInPendingTab = (event, cId) => {
    const isChecked = event.target.checked;

    const updatedTransformedData = tableData.transformedData.map((eachItem) => {
      if (eachItem.customerId === cId) {
        return { ...eachItem, isChecked };
      }
      return eachItem;
    });

    // Update tableData with the modified transformedData
    setTableData((prevData) => ({
      ...prevData,
      transformedData: updatedTransformedData,
    }));

    // Handle the item in approvedData based on the checkbox state
    setApprovedData((prevData) => {
      if (isChecked) {
        const newApprovedData = [
          ...prevData,
          ...updatedTransformedData.filter((item) => item.customerId === cId),
        ];
        // Ensure uniqueness based on customerId
        const uniqueApprovedData = newApprovedData.reduce((unique, item) => {
          if (
            !unique.some(
              (existingItem) => existingItem.customerId === item.customerId
            )
          ) {
            unique.push(item);
          }
          return unique;
        }, []);
        return uniqueApprovedData;
      } else {
        return prevData.filter((item) => item.customerId !== cId);
      }
    });

    // Handle the item in pendingTabData based on the checkbox state
    setPendingTabData((prevData) => {
      if (!isChecked) {
        return [
          ...prevData,
          ...updatedTransformedData.filter((item) => item.customerId === cId),
        ];
      } else {
        return prevData.filter((item) => item.customerId !== cId);
      }
    });

    console.log("Transformed data:", updatedTransformedData);
  };

  const onClickSaveButton = async () => {
    try {
      // Filter checked and unchecked items
      const checkedItems = tableData.transformedData.filter(
        (item) => item.isChecked
      );
      const uncheckedItems = tableData.transformedData.filter(
        (item) => !item.isChecked
      );

      // Add checked items to approved data and send to the server
      const url = "https://winit-backend.onrender.com/winit_services/approved_tab";
      const response = await axios.post(url, checkedItems, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Delete checked items from the pending tab on the server
      const deleteUrl =
        "http://localhost:3000/winit_services/delete_approved_data";
      const deleteResponse = await axios.delete(deleteUrl, {
        data: checkedItems, // Pass the checked items in the request body
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 && deleteResponse.status === 200) {
        console.log(
          "Checked items successfully moved to approved tab and deleted from pending tab"
        );

        // Update tableData with unchecked items
        setTableData((prevData) => ({
          ...prevData,
          transformedData: uncheckedItems,
        }));
      } else {
        console.log(
          "Error in processing request. Status Code:",
          response.status,
          deleteResponse.status
        );
      }
    } catch (error) {
      console.error("Error Details:", error);

      if (error.response) {
        console.error("Response Error Status:", error.response.status);
        console.error("Response Error Data:", error.response.data);
      } else if (error.request) {
        console.error("No Response Received:", error.request);
      } else {
        console.error("Error Message:", error.message);
      }
    }
  };

  const onClickSelectedTab = async (tab) => {
    if (tab.tabName === 'Approved') {
        try {
            const url = 'https://winit-backend.onrender.com/winit_services/all_approved_products';
            const response = await axios.get(url, { headers: { "Content-Type": 'application/json' } });
            console.log("Response data of approved products", response.data.approvedProducts);
            setApprovedData(response.data.approvedProducts);
            setSelectedTab(tab.tabName);
        } catch (error) {
            console.log("Error in setting tab to approved", error);
        }
    } else if (tab.tabName === "Rejected") {
        try {
            const url = 'https://winit-backend.onrender.com/winit_services/all_products_rejected';
            const response = await axios.get(url, { headers: { "Content-Type": "application/json" } });

            if (response.status === 200) {
                const resultObj = response.data[0];
                console.log('Response from rejected tab', resultObj.rejected);

                // Map customer names to the rejected data
                const updatedRejectedData = resultObj.rejected.map(product => {
                    const customer = customersList.find(c => c.customerId === product.customerId);
                    return {
                        ...product,
                        customerName: customer ? customer.customerName : 'Unknown'
                    };
                });

                // Filter out unique objects based on customerId
                const uniqueRejectedData = updatedRejectedData.filter((product, index, self) =>
                    index === self.findIndex(p => p.customerId === product.customerId)
                );

                setRejectedData(uniqueRejectedData);
                setSelectedTab("Rejected");
            } else {
                console.log("Error in making request");
            }
        } catch (error) {
            console.log("Internal server error", error);
        }
    } else {
        setSelectedTab(tabsList[0].tabName);
    }
};


  const returnPendingResult = ()=>(


    <div className="home_bg_container">
      <h1>Sales Order</h1>
      <div className="select-add-button-container">
        <div className="dropdown">
          <button
            className="btn btn-info dropdown-toggle p-2"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {selectedCustomer}
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {customersList.map((each) => (
              <p
                key={each.customerId}
                onClick={() =>
                  handleCustomerSelect(
                    each.customerId,
                    each.customerName,
                    each.address
                  )
                }
                className="dropdown-item"
              >
                {each.customerName}
              </p>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary p-2 w-25"
          onClick={handleAddClick}
        >
          Add
        </button>
      </div>

      <div className="tabs_container">
        {tabsList.map((tab) => (
          <button
            key={tab.id}
            className={`tab_button ${
              tab.tabName === selectedTab ? "active" : ""
            }`}
            type="button"
            onClick={() => onClickSelectedTab(tab)}
          >
            {tab.tabName}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Sales Order Number</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.transformedData &&
              tableData.transformedData.map((each, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={each.isChecked || false}
                      onClick={(event) =>
                        onClickCheckBoxInPendingTab(event, each.customerId)
                      }
                    />
                  </td>
                  <td>{each.salesOrderNumber}</td>
                  <td>{each.customerName}</td>
                  <td>{each.orderDate}</td>
                  <td>{each.totalAmount}</td>
                  <td>
                    <button className="action_container">
                      <CiEdit
                        color="black"
                        size={25}
                        style={{ cursor: "pointer" }}
                        onClick={() => onClickEditInHome(each.customerId)}
                      />

                      <Popup
                        trigger={
                          <MdDeleteOutline
                            size={25}
                            style={{ cursor: "pointer" }}
                          />
                        }
                        modal
                        contentStyle={{
                          width: "700px",
                          borderRadius: "10px",
                        }}
                      >
                        {(close) => (
                          <div className="delete_confirmation_popup_container">
                            <IoCloseSharp
                              size={25}
                              color="red"
                              style={{
                                cursor: "pointer",
                                position: "absolute",
                                right: "0",
                              }}
                            />
                            <h4 style={{ marginTop: "30px" }}>
                              Do you really want to delete this item from Store?
                            </h4>
                            <p>Click Confirm to do so...</p>
                            <div className="text-center ">
                              <button
                                type="button"
                                className="btn btn-secondary mr-5"
                                onClick={() => close()}
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                  OnClickDeleteInHome(each.customerId,each.itemCode);
                                  close();
                                }}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </Popup>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="clear_save_button text-center mt-5">
        <button className="btn btn-secondary mr-5">Clear</button>
        <button className="btn btn-primary" onClick={onClickSaveButton}>
          Save
        </button>
      </div>
    </div>



  )


  const returnApprovedResult =(lst)=>{
    return (
      <div className="home_bg_container">
        <h1>Sales Order</h1>
      <div className="select-add-button-container">
        <div className="dropdown">
          <button
            className="btn btn-info dropdown-toggle p-2"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {selectedCustomer}
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {customersList.map((each) => (
              <p
                key={each.customerId}
                onClick={() =>
                  handleCustomerSelect(
                    each.customerId,
                    each.customerName,
                    each.address
                  )
                }
                className="dropdown-item"
              >
                {each.customerName}
              </p>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary p-2 w-25"
          onClick={handleAddClick}
        >
          Add
        </button>
      </div>

      <div className="tabs_container">
        {tabsList.map((tab) => (
          <button
            key={tab.id}
            className={`tab_button ${
              tab.tabName === selectedTab ? "active" : ""
            }`}
            type="button"
            onClick={() => onClickSelectedTab(tab)}
          >
            {tab.tabName}
          </button>
        ))}
      </div>
      

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {/* <th>Select</th> */}
              <th>Sales Order Number</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Total Amount</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {lst &&
              lst.map((each, index) => (
                <tr key={index}>
                  {/* <td>
                    <input
                      type="checkbox"
                      checked={each.isChecked || false}
                      onClick={(event) =>
                        onClickCheckBoxInPendingTab(event, each.customerId)
                      }
                    />
                  </td> */}
                  <td>{each.salesOrderNumber}</td>
                  <td>{each.customerName}</td>
                  <td>{each.orderDate}</td>
                  <td>{each.totalAmount}</td>
                  {/* <td>
                    <button className="action_container">
                      <CiEdit
                        color="black"
                        size={25}
                        style={{ cursor: "pointer" }}
                        onClick={() => onClickEditInHome(each.customerId)}
                      />

                      <Popup
                        trigger={
                          <MdDeleteOutline
                            size={25}
                            style={{ cursor: "pointer" }}
                          />
                        }
                        modal
                        contentStyle={{
                          width: "700px",
                          borderRadius: "10px",
                        }}
                      >
                        {(close) => (
                          <div className="delete_confirmation_popup_container">
                            <IoCloseSharp
                              size={25}
                              color="red"
                              style={{
                                cursor: "pointer",
                                position: "absolute",
                                right: "0",
                              }}
                            />
                            <h4 style={{ marginTop: "30px" }}>
                              Do you really want to delete this item from Store?
                            </h4>
                            <p>Click Confirm to do so...</p>
                            <div className="text-center ">
                              <button
                                type="button"
                                className="btn btn-secondary mr-5"
                                onClick={() => close()}
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                  OnClickDeleteInHome(each.customerId);
                                  close();
                                }}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </Popup>
                    </button>
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      

      <div className="clear_save_button text-center mt-5">
        <button className="btn btn-secondary mr-5">Clear</button>
        <button className="btn btn-primary" onClick={onClickSaveButton}>
          Save
        </button>
      </div>
      
      </div>
    )
  }


  const returnRejectedResult =(lst)=>{
    return (
      <div className="home_bg_container">
          <h1>Sales Order</h1>
        <div className="select-add-button-container">
          <div className="dropdown">
            <button
              className="btn btn-info dropdown-toggle p-2"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {selectedCustomer}
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {customersList.map((each) => (
                <p
                  key={each.customerId}
                  onClick={() =>
                    handleCustomerSelect(
                      each.customerId,
                      each.customerName,
                      each.address
                    )
                  }
                  className="dropdown-item"
                >
                  {each.customerName}
                </p>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary p-2 w-25"
            onClick={handleAddClick}
          >
            Add
          </button>
        </div>

        <div className="tabs_container">
        {tabsList.map((tab) => (
          <button
            key={tab.id}
            className={`tab_button ${
              tab.tabName === selectedTab ? "active" : ""
            }`}
            type="button"
            onClick={() => onClickSelectedTab(tab)}
          >
            {tab.tabName}
          </button>
        ))}
      </div>



      <div className="table-container">
        <table>
          <thead>
            <tr>
              {/* <th>Select</th> */}
              <th>Sales Order Number</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Total Amount</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {lst &&
              lst.map((each, index) => (
                <tr key={index}>
                  {/* <td>
                    <input
                      type="checkbox"
                      checked={each.isChecked || false}
                      onClick={(event) =>
                        onClickCheckBoxInPendingTab(event, each.customerId)
                      }
                    />
                  </td> */}
                  <td>{each.salesOrderNumber}</td>
                  <td>{each.customerName}</td>
                  <td>{each.orderDate}</td>
                  <td>{each.totalAmount}</td>
                  {/* <td>
                    <button className="action_container">
                      <CiEdit
                        color="black"
                        size={25}
                        style={{ cursor: "pointer" }}
                        onClick={() => onClickEditInHome(each.customerId)}
                      />

                      <Popup
                        trigger={
                          <MdDeleteOutline
                            size={25}
                            style={{ cursor: "pointer" }}
                          />
                        }
                        modal
                        contentStyle={{
                          width: "700px",
                          borderRadius: "10px",
                        }}
                      >
                        {(close) => (
                          <div className="delete_confirmation_popup_container">
                            <IoCloseSharp
                              size={25}
                              color="red"
                              style={{
                                cursor: "pointer",
                                position: "absolute",
                                right: "0",
                              }}
                            />
                            <h4 style={{ marginTop: "30px" }}>
                              Do you really want to delete this item from Store?
                            </h4>
                            <p>Click Confirm to do so...</p>
                            <div className="text-center ">
                              <button
                                type="button"
                                className="btn btn-secondary mr-5"
                                onClick={() => close()}
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                  OnClickDeleteInHome(each.customerId);
                                  close();
                                }}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </Popup>
                    </button>
                  </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>






      </div>
    )

  }


  const FinalResult = ()=>{
    switch (selectedTab){
      case tabsList[0].tabName:
        return returnPendingResult()
      case tabsList[1].tabName:
        return returnApprovedResult(approvedData)
        break;
      case tabsList[2].tabName:
        return returnRejectedResult(rejectedData)
        break;
    }
  }



  return (
    
    
        FinalResult()
      
    
    
  )
};

export default Home;
