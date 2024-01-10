import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import AxiosIntance from "../util/AxiosIntance";
import { useEffect } from "react";
import { useState } from "react";
import { IconButton, Searchbar } from "react-native-paper";
import { AppConText } from "../util/AppContext";
import ItemListWorkStaff from "./ItemListWorkStaff";

const WorkStaff = () => {
  const [dataWork, setDataWork] = useState([]);
  const {inforUser} = useContext(AppConText);

  // TODO: lấy danh sách công việc
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get(`/work/user-work/${inforUser._id}`);
      const apiData = response;
      setDataWork(apiData);
    } catch (error) {
      console.log("Lỗi lấy danh sách công việc", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          padding: 10,
        }}
      >
        <Searchbar
          placeholder="Tìm kiếm"
          // onChangeText={onChangeSearch}
          // value={searchQuery}
          style={{ borderRadius: 10, width: "100%" }}
          icon={() => <IconButton icon="calendar" />}
        />
      </View>

      <FlatList
        data={dataWork}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ItemListWorkStaff item={item} />}
        style={{ marginBottom: "21%" }}
      />

    </View>
  );
};

export default WorkStaff;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  fab: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E55A7",
    borderRadius: 18,
    elevation: 8,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 5,
  },
  modalContent: {
    padding: 10,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#888",
    marginTop: 10,
  },
  textInput: {
    marginTop: 5,
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
});
