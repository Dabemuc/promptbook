import { Header } from "./components/Header";
import { Body } from "./components/Body";
import { Footer } from "./components/Footer";
import { PopupContextProvider } from "./contexts/PopupContext";

export default function Popup() {
  return (
    <div className="h-full">
      <PopupContextProvider>
        <Header />
        <Body />
        <Footer />
      </PopupContextProvider>
    </div>
  );
}
