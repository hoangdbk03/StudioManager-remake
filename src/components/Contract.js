import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import { AppConText } from "../util/AppContext";
import { styleModal } from "../style/styleModal";
import { Dropdown } from "react-native-element-dropdown";
import AxiosIntance from "../util/AxiosIntance";
import { TextInput } from "react-native-paper";

const Contract = () => {
  const { inforUser } = useContext(AppConText);
  const [isModalCreateVisible, setModalCreateVisible] = useState(false);

  // * Phần của khách hàng
  const [dataClient, setDataClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dataClientSelected, setDataClientSelected] = useState([]);
  const [showClientInfo, setShowClientInfo] = useState(false);

  // * Phần của dịch vụ
  const [dataService, setDataService] = useState([]);

  const toggleModalCreate = () => {
    setModalCreateVisible(!isModalCreateVisible);
    setShowClientInfo(false);
  };

  // TODO: lấy danh sách khách hàng
  const fetchDataClient = async () => {
    try {
      const response = await AxiosIntance().get("/client/list");
      const apiData = response;
      setDataClient(apiData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng ở hợp đồng", error);
    }
  };
  // TODO: lấy danh sách dịch vụ
  const fetchDataService = async () => {
    try {
      const response = await AxiosIntance().get("/service/list");
      const apiData = response;
      setDataService(apiData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ ở hợp đồng", error);
    }
  };
  useEffect(() => {
    fetchDataClient();
    fetchDataService();
  }, []);

  return (
    <View style={styles.container}>
      {/* Floating button */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.floatingAdd}
        onPress={toggleModalCreate}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal tạo hợp đồng */}
      <Modal isVisible={isModalCreateVisible}>
        <View style={styles.containerModal}>
          <ScrollView>
            <Text style={styles.titleModal}>Bảng hợp đồng</Text>
            {/* Phần chọn khách hàng */}
            <>
              <Dropdown
                search
                searchPlaceholder="Tìm kiếm..."
                style={styles.dropdown}
                placeholder="Chọn khách hàng"
                value={selectedClient}
                onChange={(item) => {
                  setSelectedClient(item.value._id),
                    setDataClientSelected(item.value);
                  setShowClientInfo(true);
                }}
                data={dataClient.map((client) => ({
                  label: `Tên: ${client.name}\n\nSố điện thoại: ${
                    client.phone
                  }\nSố điện thoại phụ: ${
                    client.phone2 ? client.phone2 : "Chưa cập nhật"
                  }`,
                  value: client,
                }))}
                labelField="label"
                valueField="value"
                placeholderStyle={{ marginStart: 5 }}
                itemContainerStyle={{
                  borderWidth: 1,
                  borderColor: "#b0b0b0",
                  margin: 5,
                  borderRadius: 5,
                }}
                itemTextStyle={{ fontWeight: "400", color: "#062446" }}
              />
              {showClientInfo && dataClientSelected && (
                <View style={{ marginTop: 10, paddingTop: 10 }}>
                  <View style={styles.rowContainer}>
                    <Text style={[styles.label, { borderWidth: 2 }]}>Tên</Text>
                    <Text
                      style={[
                        styles.label2,
                        {
                          borderTopWidth: 2,
                          borderRightWidth: 2,
                          borderBottomWidth: 2,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {dataClientSelected.name}
                    </Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text
                      style={[
                        styles.label,
                        { borderRightWidth: 2, borderLeftWidth: 2 },
                      ]}
                    >
                      Số điện thoại
                    </Text>
                    <Text style={[styles.label2, { borderRightWidth: 2 }]}>
                      {dataClientSelected.phone}
                    </Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text style={[styles.label, { borderWidth: 2 }]}>
                      Số điện thoại phụ
                    </Text>
                    <Text
                      style={[
                        styles.label2,
                        {
                          borderRightWidth: 2,
                          borderTopWidth: 2,
                          borderBottomWidth: 2,
                        },
                      ]}
                    >
                      {dataClientSelected.phone2
                        ? dataClientSelected.phone2
                        : "Chưa cập nhật"}
                    </Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text
                      style={[
                        styles.label,
                        {
                          borderRightWidth: 2,
                          borderLeftWidth: 2,
                          borderBottomWidth: 2,
                        },
                      ]}
                    >
                      Địa chỉ
                    </Text>
                    <Text
                      style={[
                        styles.label2,
                        {
                          borderRightWidth: 2,
                          borderBottomWidth: 2,
                        },
                      ]}
                    >
                      {dataClientSelected.address}
                    </Text>
                  </View>
                </View>
              )}
            </>

            {/* Phần chọn dịch vụ */}

            {/* Phần chọn trang phục */}
          </ScrollView>
        </View>

        {/* Phần 2 nút nhấn của modal */}
        <View
          style={[
            styleModal.buttonModal,
            { backgroundColor: "white", borderRadius: 5 },
          ]}
        >
          <TouchableOpacity
            onPress={toggleModalCreate}
            style={styleModal.button1}
          >
            <Text style={styleModal.textButton1}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styleModal.button2}
            // onPress={HandleChangePass}
          >
            <Text style={styleModal.textButton2}>Tạo</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Contract;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingAdd: {
    position: "absolute",
    bottom: 150,
    right: 20,
    alignItems: "center",
    borderRadius: 100,
    justifyContent: "center",
    width: 56,
    height: 56,
    backgroundColor: "#0E55A7",
  },
  titleModal: {
    width: "100%",
    textAlign: "center",
    padding: 20,
    color: "#0e55a7",
    fontWeight: "bold",
    fontSize: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#b0b0b0",
    marginBottom: 10,
  },
  containerModal: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 4,
    padding: 10,
  },
  dropdown: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#b0b0b0",
    borderRadius: 5,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    width: "30%",
    padding: 10,
    borderColor: "#b0b0b0",
  },
  label2: {
    width: "70%",
    padding: 10,
    borderColor: "#b0b0b0",
  },
});
