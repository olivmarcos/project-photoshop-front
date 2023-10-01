import ImageUploader from "../components/ImageUploader";

function Editor() {
  return (
    <div className="w-full h-full flex flex-col items-center gap-4">
      <div className="bg-rose-400 text-white flex items-center justify-between w-full h-16 px-6 rounded-md shadow-md">
        <span className="font-bold">PDI - Project Photoshop</span>
        {/* <span>Download images</span> */}
      </div>
      <ImageUploader></ImageUploader>
    </div>
  );
}

export default Editor;