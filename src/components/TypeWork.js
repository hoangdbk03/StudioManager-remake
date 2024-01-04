import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import AxiosIntance from "../util/AxiosIntance";
import ItemListTypeWork from "../components/ItemListTypeWork";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import { styleModal } from "../style/styleModal";
import { TextInput } from "react-native-paper";

const TypeWork = () => {
  const [dataTypeWork, setDataTypeWork] = useState([]);
  const [isVisibleModalCreate, setVisibleModalCreate] = useState(false);

  const toggleModalCreate = () => {
    setVisibleModalCreate(!isVisibleModalCreate);
  };

  // TODO: lấy danh sách loại cv
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get("/work/list");
      const apiData = response;
      setDataTypeWork(apiData);
    } catch (error) {
      console.log("Lỗi gọi danh sách loại công việc", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        key={(dataTypeWork.length / 2).toString()}
        data={dataTypeWork}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index}) => (
          <ItemListTypeWork item={item} index={index} totalItems={dataTypeWork.length}/>
        )}
        numColumns={2}
      />
      <TouchableOpacity
        activeOpacity={1}
        style={styles.floatingAdd}
        onPress={toggleModalCreate}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal isVisible={isVisibleModalCreate}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.titleModal}>Thêm loại công việc</Text>
            <TextInput
              label="Loại công việc"
              mode="outlined"
              style={styles.textInput}
            />
          </View>
          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalCreate}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={updateService}
              style={styleModal.button2}
            >
              <Text style={styleModal.textButton2}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TypeWork;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  floatingAdd: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    width: 56,
    height: 56,
    backgroundColor: "#0E55A7",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 5,
  },
  modalContent: {
    padding: 10,
  },
  titleModal: {
    padding: 18,
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    backgroundColor: "#0E55A7",
    borderRadius: 10,
    textAlign: "center",
  },
  textInput: {
    marginTop: 10,
  },
});
