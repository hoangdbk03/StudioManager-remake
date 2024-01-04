import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { PieChart } from "react-native-chart-kit";
import AxiosIntance from "../util/AxiosIntance";
import { TextInput } from "react-native-paper";

const Statistical = () => {
  const [data, setData] = useState([]);
  const [dataOutfit, setDataOutfit] = useState([]);

  const [totalPirceByDate, setTotalPirceByDate] = useState([]);

  const [dataDate, setDataDate] = useState({
    month: "",
    year: "",
  });

  useEffect(() => {
    fetchDataStatistic();
    fetchDataOutfit();
  }, []);

  // TODO: lấy danh sách dịch vụ sử dụng nhiều
  const fetchDataStatistic = async () => {
    try {
      const response = await AxiosIntance().get("/statistic/service-usage");
      setData(response);
    } catch (error) {
      console.log(data);
      console.log("Lỗi lấy danh sách dịch vụ sử dụng nhiều", error);
    }
  };

  // TODO: lấy danh sách trang phục sử dụng nhiều
  const fetchDataOutfit = async () => {
    try {
      const response = await AxiosIntance().get(
        "/statistic/wedding-outfit-usage"
      );
      setDataOutfit(response);
    } catch (error) {
      console.log("Lỗi lấy danh sách trang phục sử dụng nhiều", error);
    }
  };

  const getRandomColor = () => {
    const color = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    return color !== "#ffffff" ? color : getRandomColor(); // Recursively call the function if the color is white
  };

  const handleGetTotalByDate = async () => {
    try {
      const response = await AxiosIntance().get(
        `/statistic/totalRevenue?month=${day}&year=${year}`
      );
      setTotalPirceByDate(response);
    } catch (error) {
      console.log("Lỗi lấy tổng doanh thu ở Statical", error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", padding: 10 }}>
          <TextInput
            label="Tháng"
            mode="outlined"
            style={styles.textInput}
            // onChangeText={(text) => {
            //   dataDate({...setDataDate, text: mont})
            // }}
          />
          <TextInput label="Năm" mode="outlined" style={styles.textInput} />
        </View>
        <Text
          style={{
            padding: 10,
            color: "white",
            backgroundColor: "#0E55A7",
            borderRadius: 5,
            width: "80%",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Thống kê
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          Tổng tiền: 32.700.000 VND
        </Text>

        <Text style={styles.titleStatical}>Hiệu suất sử dụng dịch vụ</Text>
        {data.length > 0 && (
          <PieChart
            data={data.map((item) => ({
              name: item.name,
              count: item.count,
              color: getRandomColor(),
            }))}
            width={400}
            height={250}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}
        <Text style={styles.titleStatical}>Hiệu suất sử dụng trang phục</Text>
        {dataOutfit.length > 0 && (
          <PieChart
            data={dataOutfit.map((item) => ({
              name: item.name,
              count: item.count,
              color: getRandomColor(),
            }))}
            width={400}
            height={250}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}
      </View>
    </ScrollView>
  );
};

export default Statistical;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  titleStatical: {
    marginTop: 60,
    fontWeight: "500",
    fontSize: 18,
  },
  textInput: {
    width: "40%",
    margin: 10,
  },
});
