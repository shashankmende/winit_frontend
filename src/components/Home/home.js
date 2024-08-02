import React, { useEffect, useState } from 'react';
import './home.css';
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const customersList = [
    { customerId: 1,
        address:"3rd Ring road, Opposite quesidy ,Block1, Dubai",
        
        salesOrderNumber: "KL0021000018", customerName: "[KL00000124] ABHILASH store" },
    { customerId: 2,address:"3rd Ring road, Opposite quesidy ,Block1, Dubai", salesOrderNumber: "KL0021000018", customerName: "[KL00000124] Akshith super mart" },
    { customerId: 3,address:"3rd Ring road, Opposite quesidy ,Block1, Dubai", salesOrderNumber: "KL0021000018", customerName: "[KL00000124] Karthik super market" },
    { customerId: 4, address:"3rd Ring road, Opposite quesidy ,Block1, Dubai",salesOrderNumber: "KL0021000018", customerName: "[KL00000124] Vishnu market" }
];

const tabsList = [
    { id: 0, tabName: "Pending" },
    { id: 1, tabName: "Approved" },
    { id: 2, tabName: "Rejected" }
];

const Home = () => {
    const [selectedCustomer, setSelectedCustomer] = useState('Select Customer Name');
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [selectedTab, setSelectedTab] = useState(tabsList[0].tabName);
    const [pendingTabData,setPendingTabData] =useState([])
    const [approvedData,setApprovedData]= useState([])
    const [rejectedData, setRejectedData] = useState([])
    const [selectedAdress,setselectedAdress]=useState('')
    const [tableData,setTableData]=useState('')
    const navigate = useNavigate();

    const handleAddClick = () => {
        if (selectedCustomer && selectedCustomerId) {
            navigate('/addProduct', { state: { selectedCustomer, customerId: selectedCustomerId,address:selectedAdress } });
        } else {
            alert('Please select a customer');
        }
    };

    const handleCustomerSelect = (customerId, customerName,address) => {
        setSelectedCustomer(customerName);
        setSelectedCustomerId(customerId);
        setselectedAdress(address)
    }

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const url = 'http://localhost:3000/winit_services/table_data';
                const response = await axios.get(url, {
                    headers: {
                        "Content-Type": 'application/json'
                    }
                });
                if (response.status === 200) {
                    const responseObject = response.data.customerSummary;
                
                    const customersMap = customersList.reduce((map, customer) => {
                        map[customer.customerId] = customer;
                        return map;
                    }, {});
                
                    const returnObject = (resObj, custMap) => {
                        return resObj.map(({ customerId, orderDate, totalAmount }) => {
                            const customer = custMap[customerId];
                            if (customer) {
                                return {
                                    salesOrderNumber: customer.salesOrderNumber,
                                    customerName: customer.customerName,
                                    customerId:customer.customerId,
                                    orderDate: orderDate,
                                    totalAmount: totalAmount
                                };
                            }
                            return null;
                        }).filter(item => item !== null); 
                    };
                
                    const requiredObject = returnObject(responseObject, customersMap);
                    setTableData(requiredObject)
                }
                
            } catch (error) {
                console.error("Error fetching table data:", error);
            }
        };
    
        fetchTableData();
    }, []);


   

    const OnClickDeleteInHome = (cId) => {
        const filteredList = tableData.filter(each => each.customerId !== cId);
        setTableData(filteredList);
    };

    const onClickEditInHome = ()=>{
        navigate('/addProduct')
    }

    return (
        <div className='home_bg_container'>
            <h1>Sales Order</h1>
            <div className='select-add-button-container'>
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
                        {customersList.map(each => (
                            <p
                                key={each.customerId}
                                onClick={() => handleCustomerSelect(each.customerId, each.customerName,each.address)}
                                className="dropdown-item"
                            >
                                {each.customerName}
                            </p>
                        ))}
                    </div>
                </div>
                <button type='button' className='btn btn-primary p-2 w-25'
                    onClick={handleAddClick}  
                >
                    Add
                </button>
            </div>

            <div className="tabs_container">
                {tabsList.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab_button ${tab.tabName === selectedTab ? 'active' : ''}`}
                        type='button'
                        onClick={() => setSelectedTab(tab.tabName)}
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
                        {tableData && tableData.map((each, index) =>
                            <tr key={index}>
                                <td><input type="checkbox"/></td>
                                <td>{each.salesOrderNumber}</td>
                                <td>{each.customerName}</td>
                                <td>{each.orderDate}</td>
                                <td>{each.totalAmount}</td>
                                <td>
                                    <button className="action_container">
                                        <CiEdit color='black' size={25} style={{cursor:"pointer"}} onClick={()=>onClickEditInHome()} />
                                        <MdDeleteOutline size={25} style={{ cursor: "pointer" }} onClick={() => OnClickDeleteInHome(each.customerId)} />
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className='clear_save_button text-center mt-5'>
                <button className='btn btn-secondary mr-5'>Clear</button>
                <button className='btn btn-primary'>Save</button>
            </div>
        </div>
    );
}

export default Home;
