import { FC } from "react";
import QRCode from "react-qr-code";


interface QrCodeGenProps {
    header: string,
    url: string,
}

const QrCodeGen: FC<QrCodeGenProps> = (props: QrCodeGenProps) => {

    return (
        <div className="px-6 py-2 w-auto">
            <p 
                className="text-xl text-center text-[#28b4fa] pb-2"
            >
                {props.header}
            </p>
            <QRCode value={props.url} size={150} />
        </div>
    )
}

export default QrCodeGen;