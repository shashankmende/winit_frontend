import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { IoCloseSharp } from "react-icons/io5";
import axios from "axios";
import { MdDeleteOutline } from "react-icons/md";
import { MdDone } from "react-icons/md";

const AddProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const { selectedCustomer, customerId, address } = location.state || {};
  const { selectedCustomer, customerId, address } = location.state || {};

  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerAddress,setcustomerAddress]=useState(address)
  const [tempData,setTempData]=useState([])

  const onClickConfirm = async () => {
    try {
      const url = 'https://winit-backend.onrender.com/winit_services/pending_tab';
      const response = await axios.post(url, { products: salesData }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        // Set order number from response if available
        setOrderNumber(response.data.orderNumber || "Pkiejj38995"); // Default value for testing
        setSuccessPopupOpen(true);
      }
    } catch (error) {
      console.log("Error in making request", error);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const url = `https://winit-backend.onrender.com/winit_services/products/${customerId}`;
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (response.status === 200) {
          setProducts(response.data);
        } else {
          console.log("Error in making API request");
        }
      } catch (error) {
        console.log("Error in hooks", error);
      }
    };
  
    if (customerId) {
      getData(); // Only call getData if customerId is defined
    }
  }, [customerId]);
  
  


  const filteredProducts = products.filter((each) =>
    each.itemName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCheckboxChange = (itemCode) => {
    setSelectedProducts((prevSelected) => {
      const updated = new Set(prevSelected);
      if (updated.has(itemCode)) {
        updated.delete(itemCode);
      } else {
        updated.add(itemCode);
      }
      return updated;
    });
  };

  const handleSave = () => {
    const selected = products.filter((product) =>
      selectedProducts.has(product.itemCode)
    );
    setSalesData((prevSalesData) => {
      const newSalesData = [...prevSalesData];
      selected.forEach((product) => {
        if (!newSalesData.find((item) => item.itemCode === product.itemCode)) {
          newSalesData.push(product);
        }
      });
      return newSalesData;
    });
  };

  const deleteItem = (itemCode) => {
    setSalesData((prevSalesData) =>
      prevSalesData.filter((item) => item.itemCode !== itemCode)
    );
  };

  const handleClear = () => {
    setSalesData([]);
  };

  const totalItems = salesData.length;
  const totalQuantity = salesData.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = salesData
    .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
    .toFixed(2);

  const handlePopupClose = () => {
    setSuccessPopupOpen(false);
    navigate("/"); // Redirect to home page
  };

  return (
    <div className="addProduct_bg_container">
      <div style={{ margin: "auto", width: "80%" }}>
        <h1 style={{ marginBottom: "15px" }}>Sales Order</h1>
        <div className="top_container">
          <div>
            <h4>{selectedCustomer}</h4>
            <p>{customerAddress}</p>
          </div>

          <Popup
            trigger={
              <button className="btn btn-primary h-50">Add Product</button>
            }
            modal
            nested
            closeOnDocumentClick={false}
            overlayStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            contentStyle={{
              borderRadius: "10px",
              padding: "0px",
            }}
          >
            {(close) => (
              <div
                style={{ borderRadius: "15px", padding: "10px" }}
                className="popup_bg_container"
              >
                <div className="heading_close_container">
                  <h4>Add Products</h4>
                  <IoCloseSharp
                    size={25}
                    style={{ cursor: "pointer", marginRight: "15px" }}
                    onClick={() => close()}
                  />
                </div>
                <div className="search_container">
                  <input
                    className="search_input"
                    type="search"
                    placeholder="Enter product"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <div className="table_container mt-3">
                  <table>
                    <thead style={{ backgroundColor: "gray" }}>
                      <tr>
                        <th>Item Code</th>
                        <th>Description</th>
                        <th>Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((each) => (
                        <tr style={{ fontWeight: "bold" }} key={each.itemCode}>
                          <td>{each.itemCode}</td>
                          <td>{each.itemName}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(each.itemCode)}
                              onChange={() =>
                                handleCheckboxChange(each.itemCode)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary mr-5"
                    onClick={() => close()}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      handleSave();
                      close();
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </Popup>
        </div>
        {salesData.length > 0 ? (
          <>
            <div className="table_container mt-3">
              <table>
                <thead style={{ backgroundColor: "gray" }}>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Total Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((each) => (
                    <tr style={{ fontWeight: "bold" }} key={each.itemCode}>
                      <td>{each.itemCode}</td>
                      <td>{each.itemName}</td>
                      <td>{each.unitPrice}</td>
                      <td>{each.quantity}</td>
                      <td>{(each.quantity * each.unitPrice).toFixed(2)}</td>
                      <td>
                        <MdDeleteOutline
                          size={25}
                          color="red"
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteItem(each.itemCode)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            
            <div className="summary_container mt-4">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "80%",
                  margin: "auto",
                }}
              >
                <p>
                  <strong>Number of Items:</strong> {totalItems}
                </p>
                <p>
                  <strong>Total Quantity:</strong> {totalQuantity}
                </p>
                <p>
                  <strong>Total Price:</strong> ₹{totalPrice}
                </p>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  className="btn btn-secondary mr-5"
                  onClick={handleClear}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onClickConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: "red" }}>No data found..Please add products</p>
        )}

        {/* Success Popup */}
        <Popup
          open={successPopupOpen}
          modal
          nested
          closeOnDocumentClick={false}
          overlayStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          contentStyle={{
            borderRadius: "10px",
            padding: "0px",
          }}
        >
          <div
            style={{ borderRadius: "15px", padding: "10px" }}
            className="popup_bg_container"
          >
            <div className="heading_close_container">
              <h4>Success</h4>
              <IoCloseSharp
                size={25}
                style={{ cursor: "pointer", marginRight: "15px" }}
                onClick={() => setSuccessPopupOpen(false)}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <MdDone size={25} color="green" style={{ fontWeight: "bold" }} />
              <h5>Order Placed Successfully</h5>
              <p>Order Number: {orderNumber}</p>
              <p>{selectedCustomer}</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSuccessPopupOpen(false);
                  navigate("/"); // Redirect to home page
                }}
              >
                OK
              </button>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default AddProduct;
