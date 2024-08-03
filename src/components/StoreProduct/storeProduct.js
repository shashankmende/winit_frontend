import React, { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";
import { MdDeleteOutline } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { MdDone } from "react-icons/md";

const StoreProduct = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const { selectedCustomer, customerId, address } = location.state || {};
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [dataFromBackend, setBackendData] = useState([]);
  const [renderingLst, setRenderingLst] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");

  useEffect(() => {
    const getPendingTable = async () => {
      try {
        const url = `https://winit-backend.onrender.com/winit_services/pending_products/${customerId}`;
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("response from add products route", response);

        setBackendData(response.data.pendingProducts);
        setRenderingLst(response.data.pendingProducts);
      } catch (error) {
        console.error("Error fetching pending products:", error);
      }
    };

    if (customerId) {
      getPendingTable();
    }
  }, [customerId, address]);

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

  const filteredProducts = products.filter((each) =>
    each.itemName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = () => {
    const selectedItems = products.filter((product) =>
      selectedProducts.has(product.itemCode)
    );

    setRenderingLst((prevList) => {
      const existingItemCodes = new Set(prevList.map((item) => item.itemCode));
      const uniqueItems = selectedItems.filter(
        (item) => !existingItemCodes.has(item.itemCode)
      );
      return [...prevList, ...uniqueItems];
    });

    setSelectedProducts(new Set());
    console.log("Updated renderingLst:", renderingLst);
  };

  const deleteItem = (itemCode) => {
    const filteredList = renderingLst.filter(
      (each) => each.itemCode !== itemCode
    );
    setRenderingLst(filteredList);
  };

  const startEditing = (itemCode, quantity) => {
    setEditingItem(itemCode);
    setNewQuantity(quantity);
  };

  const handleQuantityChange = (e) => {
    setNewQuantity(parseInt(e.target.value));
  };

  const saveNewQuantity = (itemCode) => {
    setRenderingLst((prevList) =>
      prevList.map((item) =>
        item.itemCode === itemCode ? { ...item, quantity: newQuantity } : item
      )
    );
    setEditingItem(null);
  };

  const onClickConfirm = async () => {
    try {
        console.log("Confirm button is clicked",renderingLst);
        const url = "https://winit-backend.onrender.com/winit_services/pending_tab_after_editing";
        const response = await axios.put(
            url,
            { customerId, products: renderingLst },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.status === 200) {
            console.log("Database updated successfully", response);
        }
    } catch (error) {
        console.log("Error in making request", error);
    }
};


  const totalItems = renderingLst.length;
  const totalQuantity = renderingLst.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const totalPrice = renderingLst
    .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
    .toFixed(2);

  return (
    <div className="stored_product_bg_container">
      <div style={{ margin: "auto", width: "80%" }}>
        <h1 style={{ marginBottom: "15px" }}>Sales Order</h1>

        <div className="stored_top_container">
          <div>
            <h4>{selectedCustomer}</h4>
            <p>{address}</p>
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

        <div className="table_container">
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
              {renderingLst.map((each) => (
                <tr style={{ fontWeight: "bold" }} key={each.itemCode}>
                  <td>{each.itemCode}</td>
                  <td>{each.itemName}</td>
                  <td>{each.unitPrice}</td>
                  <td style={{ display: "flex" }}>
                    {editingItem === each.itemCode ? (
                      <>
                        <input
                          type="number"
                          value={newQuantity}
                          onChange={handleQuantityChange}
                          style={{ width: "50px" }}
                        />
                        <button
                          onClick={() => saveNewQuantity(each.itemCode)}
                          style={{
                            marginLeft: "10px",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            color: "green",
                            fontWeight: "bold",
                          }}
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <p>{each.quantity}</p>
                        <CiEdit
                          size={25}
                          style={{ marginLeft: "10px", cursor: "pointer" }}
                          onClick={() =>
                            startEditing(each.itemCode, each.quantity)
                          }
                        />
                      </>
                    )}
                  </td>
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
              // onClick={handleClear}
              onClick={()=>{
                navigate('/')
              }}
            >
              Cancel
            </button>
            <Popup
              // open={successPopupOpen}
              trigger={
                <button className="btn btn-primary" onClick={onClickConfirm}>
                  Confirm
                </button>
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
              {close=>(<div
                style={{ borderRadius: "15px", padding: "10px" }}
                className="popup_bg_container"
              >
                <div className="heading_close_container">
                  <h4>Success</h4>
                  <IoCloseSharp
                    size={25}
                    style={{ cursor: "pointer", marginRight: "15px" }}
                    onClick={() => close()}

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
                  <MdDone
                    size={25}
                    color="green"
                    style={{ fontWeight: "bold" }}
                  />
                  <h5>Store updated Successfully</h5>
                  {/* <p>Order Number: {orderNumber}</p> */}
                  <p>{selectedCustomer}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      // setSuccessPopupOpen(false);
                      navigate("/"); // Redirect to home page
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>)}
            </Popup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProduct;
