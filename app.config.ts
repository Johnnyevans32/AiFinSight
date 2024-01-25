export default defineAppConfig({
  defaultDwnEndpoint: `https://dwn.tbddev.org/dwn1`,
});
const iod = {
  id: "did:web:dwn.tbddev.org",
  service: [
    {
      id: "#dwn",
      serviceEndpoint: {
        nodes: [
          "https://dwn.tbddev.org/dwn0",
          "https://dwn.tbddev.org/dwn1",
          "https://dwn.tbddev.org/dwn2",
          "https://dwn.tbddev.org/dwn3",
          "https://dwn.tbddev.org/dwn4",
          "https://dwn.tbddev.org/dwn5",
          "https://dwn.tbddev.org/dwn6",
        ],
      },
      type: "DecentralizedWebNode",
    },
  ],
};
